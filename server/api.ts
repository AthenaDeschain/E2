import { Router } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { authenticate, createToken } from './auth';
import { v4 as uuidv4 } from 'uuid';
import { CommunityCategory, CreateProjectPayload, UpdateUserPayload, CreateEventPayload, UserStats, User } from '../src/types';
import { broadcast } from './websocket';
import { GoogleGenAI, Type } from "@google/genai";
import { AppError } from './errors';

// Model Imports
import { UserModel } from './models/User';
import { PostModel } from './models/Post';
import { CommentModel } from './models/Comment';
import { ProjectModel } from './models/Project';
import { NotificationModel } from './models/Notification';
import { EventModel } from './models/Event';


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will be disabled.");
}
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;


const router = Router();

const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<any>) =>
    (req: any, res: any, next: any) => fn(req, res, next).catch(next);

// --- Notification Helper ---
async function createNotification(recipientId: string, senderId: string, type: 'like' | 'comment' | 'mention' | 'project_invite', content: string, link: string) {
    if (recipientId.toString() === senderId.toString()) return;

    const notificationDoc = await NotificationModel.create({
        recipient: recipientId,
        sender: senderId,
        type,
        content,
        link,
        timestamp: new Date()
    });
    
    const notification = await NotificationModel.findById(notificationDoc._id).populate('sender', 'id name handle avatarUrl');
    
    broadcast('new_notification', notification?.toJSON());
}


// --- Auth Routes ---
const signupSchema = z.object({
    name: z.string().min(1, "Name cannot be empty"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
router.post('/auth/signup', asyncHandler(async (req, res) => {
    const { name, email, password } = signupSchema.parse(req.body);

    const newUser = await UserModel.create({
        name,
        email,
        password, // Hashing is handled by the pre-save hook in the model
        handle: name.toLowerCase().replace(/\s/g, '_') + Date.now().toString().slice(-4),
        avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
    });
    
    const token = createToken(newUser);
    res.status(201).json({ token, user: newUser.toJSON() });
}));

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
router.post('/auth/login', asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await UserModel.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Invalid email or password.', 401);
    }
    
    const token = createToken(user);
    res.json({ token, user: user.toJSON() });
}));

router.get('/auth/me', authenticate, (req, res) => {
    res.json(req.user);
});

router.post('/auth/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully.' });
});

const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6),
});
router.post('/auth/change-password', authenticate, asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user!.id;
    const user = await UserModel.findById(userId).select('+password');

    if (!user || !(await user.comparePassword(currentPassword))) {
        throw new AppError('Incorrect current password.', 403);
    }
    
    user.password = newPassword;
    await user.save();
    
    res.status(204).send();
}));


// --- User Routes ---
router.put('/users/me', authenticate, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const payload: UpdateUserPayload = req.body;
    
    const updateData: Partial<UpdateUserPayload> & { interests?: string[] } = {};
    if (payload.name) updateData.name = payload.name;
    if (payload.bio) updateData.bio = payload.bio;
    if (payload.role) updateData.role = payload.role;
    if (payload.interests) updateData.interests = payload.interests;

    const updatedUser = await UserModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

    if (!updatedUser) throw new AppError('User not found.', 404);
    res.json(updatedUser.toJSON());
}));

const deleteAccountSchema = z.object({ password: z.string() });
router.delete('/users/me', authenticate, asyncHandler(async(req, res) => {
    const { password } = deleteAccountSchema.parse(req.body);
    const userId = req.user!.id;
    const user = await UserModel.findById(userId).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Incorrect password.', 403);
    }
    
    await UserModel.findByIdAndDelete(userId);
    res.status(204).send();
}));

router.get('/users/me/stats', authenticate, asyncHandler(async(req, res) => {
    const userId = req.user!.id;
    const postsCount = await PostModel.countDocuments({ author: userId });
    const projectsCount = await ProjectModel.countDocuments({ 'members.user': userId });
    const stats: UserStats = { posts: postsCount, projects: projectsCount, reviews: 0, citations: 0 };
    res.json(stats);
}));

// --- Post & Bookmark Routes ---
const getPostsPipeline = (userId: string, matchClause: object = {}) => {
    const currentUserId = new mongoose.Types.ObjectId(userId);
    return [
      { $match: matchClause },
      { $sort: { created_at: -1 } },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' },
      { $lookup: { from: 'comments', localField: '_id', foreignField: 'post', as: 'comments' } },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' },
          isLiked: { $in: [currentUserId, '$likes'] }
        }
      },
      {
        $project: {
          id: '$_id', _id: 0, content: 1, category: 1, timestamp: '$created_at',
          author: { id: '$author._id', name: '$author.name', handle: '$author.handle', avatarUrl: '$author.avatarUrl' },
          likes: '$likesCount',
          comments: '$commentsCount',
          isLiked: 1
        }
      }
    ];
};

const addBookmarkStatus = async (posts: any[], userId: string) => {
    const user = await UserModel.findById(userId).select('bookmarks').lean();
    const bookmarkedIds = new Set(user?.bookmarks?.map(id => id.toString()));
    return posts.map(post => ({
        ...post,
        isBookmarked: bookmarkedIds.has(post.id.toString())
    }));
};

router.get('/posts', authenticate, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const pipeline = getPostsPipeline(userId);
    const posts = await PostModel.aggregate(pipeline);
    const postsWithBookmarks = await addBookmarkStatus(posts, userId);
    res.json(postsWithBookmarks);
}));

router.get('/posts/category/:category', authenticate, asyncHandler(async (req, res) => {
    const { category } = req.params;
    const userId = req.user!.id;
    if (!Object.values(CommunityCategory).includes(category as CommunityCategory)) {
        throw new AppError('Invalid category specified.', 400);
    }
    const pipeline = getPostsPipeline(userId, { category });
    const posts = await PostModel.aggregate(pipeline);
    const postsWithBookmarks = await addBookmarkStatus(posts, userId);
    res.json(postsWithBookmarks);
}));

router.get('/posts/:postId', authenticate, asyncHandler(async(req, res) => {
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) throw new AppError('Invalid Post ID', 400);
    const userId = req.user!.id;
    const pipeline = getPostsPipeline(userId, { _id: new mongoose.Types.ObjectId(postId) });
    const posts = await PostModel.aggregate(pipeline);
    if (posts.length === 0) throw new AppError('Post not found.', 404);
    const postsWithBookmarks = await addBookmarkStatus(posts, userId);
    res.json(postsWithBookmarks[0]);
}));

router.get('/bookmarks', authenticate, asyncHandler(async(req, res) => {
    const userId = req.user!.id;
    const user = await UserModel.findById(userId).select('bookmarks');
    if (!user) throw new AppError('User not found', 404);
    const pipeline = getPostsPipeline(userId, { _id: { $in: user.bookmarks } });
    const posts = await PostModel.aggregate(pipeline);
    // All returned posts are bookmarked by definition
    const postsWithBookmarks = posts.map(p => ({ ...p, isBookmarked: true }));
    res.json(postsWithBookmarks);
}));

const createPostSchema = z.object({ content: z.string().min(1), category: z.nativeEnum(CommunityCategory) });
router.post('/posts', authenticate, asyncHandler(async (req, res) => {
    const { content, category } = createPostSchema.parse(req.body);
    const user = req.user!;
    const newPostDoc = await PostModel.create({ content, category, author: user.id });
    const newPost = await PostModel.findById(newPostDoc._id).populate('author');

    if (!newPost) throw new AppError('Failed to create post', 500);

    const postJSON = newPost.toJSON();
    const responsePayload = {
        ...postJSON,
        timestamp: newPost.get('created_at').toISOString(),
        author: {
            id: (newPost.author as any).id,
            name: (newPost.author as any).name,
            handle: (newPost.author as any).handle,
            avatarUrl: (newPost.author as any).avatarUrl,
        },
        likes: 0,
        comments: 0,
        isLiked: false,
        isBookmarked: false,
    };
    broadcast('new_post', responsePayload);
    res.status(201).json(responsePayload);
}));

router.post('/posts/:postId/like', authenticate, asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user!.id;
    
    const post = await PostModel.findById(postId);
    if (!post) throw new AppError('Post not found', 404);

    const isLiked = post.likes.includes(new mongoose.Types.ObjectId(userId));
    
    const update = isLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updatedPost = await PostModel.findByIdAndUpdate(postId, update, { new: true });
    
    if (!isLiked) {
        await createNotification(post.author.toString(), userId, 'like', 'liked your post.', `/posts/${postId}`);
    }

    res.json({ likes: updatedPost?.likes.length ?? 0, isLiked: !isLiked });
}));

router.post('/posts/:postId/bookmark', authenticate, asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user!.id;
    
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const isBookmarked = user.bookmarks?.includes(new mongoose.Types.ObjectId(postId));

    const update = isBookmarked
      ? { $pull: { bookmarks: postId } }
      : { $addToSet: { bookmarks: postId } };
      
    await UserModel.findByIdAndUpdate(userId, update);

    res.json({ isBookmarked: !isBookmarked });
}));


// --- Comment Routes ---
router.get('/posts/:postId/comments', authenticate, asyncHandler(async (req, res) => {
    const comments = await CommentModel.find({ post: req.params.postId })
      .populate('author', 'id name handle avatarUrl')
      .sort({ created_at: 'asc' });

    res.json(comments.map(c => ({
        ...c.toJSON(),
        timestamp: c.get('created_at').toISOString()
    })));
}));

router.post('/posts/:postId/comments', authenticate, asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const content = req.body.content;
    const user = req.user!;
    
    const newCommentDoc = await CommentModel.create({ post: postId, author: user.id, content });
    const newComment = await CommentModel.findById(newCommentDoc._id).populate('author', 'id name handle avatarUrl');
    
    if (!newComment) throw new AppError('Failed to create comment', 500);

    const post = await PostModel.findById(postId);
    if (post) await createNotification(post.author.toString(), user.id, 'comment', 'commented on your post.', `/posts/${postId}`);

    const payload = {
        postId,
        comment: {
            ...newComment.toJSON(),
            timestamp: newComment.get('created_at').toISOString()
        }
    };
    broadcast('new_comment', payload);
    res.status(201).json(payload.comment);
}));

// --- Project Routes ---
router.post('/projects', authenticate, asyncHandler(async (req, res) => {
    const payload: CreateProjectPayload = req.body;
    const user = req.user!;
    const newProject = await ProjectModel.create({
        ...payload,
        status: 'Recruiting',
        progress: 0,
        members: [{ user: user.id, projectRole: 'Lead' }],
    });
    
    const projectWithMember = await ProjectModel.findById(newProject._id).populate('members.user');
    res.status(201).json(projectWithMember?.toJSON());
}));

router.get('/projects/mine', authenticate, asyncHandler(async(req, res) => {
    const userId = req.user!.id;
    const projects = await ProjectModel.find({ 'members.user': userId })
        .populate('members.user', 'id name handle avatarUrl')
        .sort({ _id: -1 });

    res.json(projects.map(p => p.toJSON()));
}));

// --- Notification Routes ---
router.get('/notifications', authenticate, asyncHandler(async(req, res) => {
    const userId = req.user!.id;
    const notifications = await NotificationModel.find({ recipient: userId })
        .populate('sender', 'id name handle avatarUrl')
        .sort({ timestamp: -1 })
        .limit(20);
    res.json(notifications.map(n => n.toJSON()));
}));

router.post('/notifications/read-all', authenticate, asyncHandler(async(req, res) => {
    await NotificationModel.updateMany({ recipient: req.user!.id, isRead: false }, { isRead: true });
    res.status(204).send();
}));


// --- Misc Routes (Events, KB, Funding, Reports) ---
router.get('/events', authenticate, asyncHandler(async (req, res) => {
    const events = await EventModel.find().sort({ date: 'asc' });
    res.json(events.map(e => e.toJSON()));
}));

router.post('/events', authenticate, asyncHandler(async (req, res) => {
    const payload: CreateEventPayload = req.body;
    const user = req.user!;
    const newEvent = await EventModel.create({ ...payload, creator: user.id });
    res.status(201).json(newEvent.toJSON());
}));

router.get('/knowledge-base/articles', authenticate, (req, res) => res.json([
    { id: 'kb-1', title: 'Getting Started with Research', description: 'A guide to forming a hypothesis.', icon: '🤔', audience: 'Civilian Scientist', category: 'Guides' },
    { id: 'kb-2', title: 'Open Source Lab Tools', description: 'Find software for your experiments.', icon: '💻', audience: 'Career Scientist', category: 'Tools' },
    { id: 'kb-3', title: 'Platform Etiquette', description: 'Best practices for community interaction.', icon: '🤝', audience: 'General', category: 'Community' },
]));
router.get('/funding/info', authenticate, (req, res) => res.json({
    tiers: [
        { id: 'tier-1', title: 'Supporter', amount: 5, recurring: 'per month', description: 'Help cover our basic server costs.', isPopular: false },
        { id: 'tier-2', title: 'Innovator', amount: 15, recurring: 'per month', description: 'Fund new feature development.', isPopular: true },
        { id: 'tier-3', title: 'Accelerator', amount: 50, recurring: 'per month', description: 'Support community outreach programs.', isPopular: false },
    ],
    sponsors: [{id: 'sp-1', name: 'Open Science Foundation'}]
}));
router.post('/reports', authenticate, (req, res) => {
    console.log(`Report received for ${req.body.contentType} ID ${req.body.contentId} from user ${req.user!.id}`);
    res.status(204).send();
});

// --- Gemini Proxy Routes (Unchanged) ---
const geminiHandler = (model: string, instruction: string, schema?: any) => asyncHandler(async (req, res) => {
    if (!ai) throw new AppError('AI features are currently unavailable.', 503);
    const { text, topic, idea, abstract } = req.body;
    const prompt = text || topic || idea || abstract;
    if (!prompt) throw new AppError('Input text is required for this AI feature.', 400);

    const response = await ai.models.generateContent({
        model, contents: prompt,
        config: { systemInstruction: instruction, ...(schema && { responseMimeType: "application/json", responseSchema: schema })},
    });
    res.json({ text: response.text.trim() });
});

router.post('/gemini/research', authenticate, geminiHandler('gemini-2.5-flash', 'You are a research assistant. Find and summarize relevant academic papers and citations for the given topic.'));
router.post('/gemini/originality', authenticate, geminiHandler('gemini-2.5-flash', 'You are an academic integrity checker. Analyze the provided text for originality and check for potential plagiarism against existing literature.'));
router.post('/gemini/language', authenticate, asyncHandler(async(req, res) => {
    if (!ai) throw new AppError('AI features are currently unavailable.', 503);
    const { text, audience } = req.body;
    const instruction = `You are an expert scientific editor. Refine the following text to improve its clarity, tone, and impact for a ${audience} audience.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: text, config: { systemInstruction: instruction }});
    res.json({ text: response.text });
}));
router.post('/gemini/review', authenticate, asyncHandler(async(req, res) => {
    if (!ai) throw new AppError('AI features are currently unavailable.', 503);
    const { text, audience } = req.body;
    const instruction = `You are an expert peer reviewer for a scientific journal. Provide a constructive, critical review of the following draft, targeting an ${audience} audience.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: text, config: { systemInstruction: instruction }});
    res.json({ text: response.text });
}));
router.post('/gemini/refine-idea', authenticate, geminiHandler('gemini-2.5-flash', 'You are a research advisor. Help refine the following rough idea into a focused, clear, and feasible research concept.'));
router.post('/gemini/create-outline', authenticate, geminiHandler('gemini-2.5-flash', 'You are a writing assistant. Create a logical and comprehensive outline for a scientific paper based on the provided idea.'));
router.post('/gemini/suggest-journals', authenticate, geminiHandler('gemini-2.5-flash', 'You are a publishing expert. Based on the provided abstract, suggest 5 suitable academic journals or conferences for submission.'));
router.post('/gemini/draft-post', authenticate, geminiHandler('gemini-2.5-flash', 'You are a social media manager for a science platform. Draft an engaging and informative post for a general audience based on the following topic.'));
router.post('/gemini/simplify', authenticate, geminiHandler('gemini-2.5-flash', 'You are a science communicator. Simplify the following complex text for a general audience, explaining any jargon.'));
router.post('/gemini/jargon-buster', authenticate, asyncHandler(async(req, res) => {
    if (!ai) throw new AppError('AI features are currently unavailable.', 503);
    const { text } = req.body;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', contents: text,
        config: {
            systemInstruction: 'You are a lexicographer specializing in scientific terms. Identify all jargon in the provided text and provide a concise, simple definition for each term. Respond ONLY with a valid JSON array of objects, where each object has a "term" and a "definition" key. If no jargon is found, return an empty array.',
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { term: { type: Type.STRING }, definition: { type: Type.STRING } } }
            }
        }
    });
    // The response is already a JSON string, so we can parse it directly
    res.json(JSON.parse(response.text));
}));

export default router;