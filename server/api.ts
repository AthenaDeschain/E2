import { Router } from 'express';
import { z } from 'zod';
import { db } from './db';
import { authenticate, comparePassword, createToken, hashPassword } from './auth';
import { v4 as uuidv4 } from 'uuid';
import { User, Post, Project, CommunityCategory, Comment, Event, Notification, CreateProjectPayload, UpdateUserPayload, CreateEventPayload, UserStats } from '../src/types';
import { broadcast } from './websocket';
import { GoogleGenAI, Type } from "@google/genai";
import { AppError } from './errors';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will be disabled.");
}
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;


const router = Router();

// Helper to wrap async routes and catch errors, passing them to the global error handler
const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<any>) =>
    (req: any, res: any, next: any) => fn(req, res, next).catch(next);

// --- Notification Helper ---
async function createNotification(recipientId: string, senderId: string, type: 'like' | 'comment' | 'mention' | 'project_invite', content: string, link: string) {
    if (recipientId === senderId) return; // Don't notify users about their own actions

    const notification: Omit<Notification, 'sender' | 'isRead'> = {
        id: `notif-${uuidv4()}`,
        type,
        content,
        link,
        timestamp: new Date().toISOString(),
    };

    await db.run(
        'INSERT INTO notifications (id, recipient_id, sender_id, type, content, link, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
        notification.id, recipientId, senderId, type, content, link, notification.timestamp
    );

    const sender = await db.get<User>('SELECT id, name, handle, avatarUrl FROM users WHERE id = ?', senderId);
    
    // The current broadcast sends to all clients. A production system might use user-specific channels.
    broadcast('new_notification', {
        ...notification,
        sender,
        isRead: false,
        recipient_id: recipientId // For potential client-side filtering
    });
}


// --- Auth Routes ---
const signupSchema = z.object({
    name: z.string().min(1, "Name cannot be empty"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
router.post('/auth/signup', asyncHandler(async (req, res) => {
    const { name, email, password } = signupSchema.parse(req.body);

    const password_hash = await hashPassword(password);
    const newUser: User = {
        id: `user-${uuidv4()}`,
        name,
        email,
        handle: name.toLowerCase().replace(/\s/g, '_') + Date.now().toString().slice(-4),
        avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
        interests: [], // Start with empty interests
    };

    await db.run(
        'INSERT INTO users (id, name, email, password_hash, handle, avatarUrl) VALUES (?, ?, ?, ?, ?, ?)',
        newUser.id, newUser.name, newUser.email, password_hash, newUser.handle, newUser.avatarUrl
    );
    
    const token = createToken(newUser);
    res.status(201).json({ token, user: newUser });
}));

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
router.post('/auth/login', asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (!user || !(await comparePassword(password, user.password_hash))) {
        throw new AppError('Invalid email or password.', 401);
    }
    
    const { password_hash, ...userPayload } = user;
    const interests = await db.all<{interest: string}[]>('SELECT interest FROM user_interests WHERE user_id = ?', user.id);
    const userPayloadWithInterests = { ...userPayload, interests: interests.map(i => i.interest) };

    const token = createToken(userPayloadWithInterests);
    res.json({ token, user: userPayloadWithInterests });
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
    const user = await db.get('SELECT password_hash FROM users WHERE id = ?', userId);

    if (!user || !(await comparePassword(currentPassword, user.password_hash))) {
        throw new AppError('Incorrect current password.', 403);
    }
    
    const newPasswordHash = await hashPassword(newPassword);
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', newPasswordHash, userId);
    
    res.status(204).send();
}));


// --- User Routes ---
router.put('/users/me', authenticate, asyncHandler(async (req, res) => {
    const user = req.user!;
    const payload: UpdateUserPayload = req.body;
    
    user.name = payload.name ?? user.name;
    user.bio = payload.bio ?? user.bio;
    user.role = payload.role ?? user.role;
    
    await db.run('UPDATE users SET name = ?, bio = ?, role = ? WHERE id = ?',
        user.name, user.bio, user.role, user.id
    );

    if (payload.interests) {
        await db.run('DELETE FROM user_interests WHERE user_id = ?', user.id);
        for (const interest of payload.interests) {
            await db.run('INSERT INTO user_interests (user_id, interest) VALUES (?, ?)', user.id, interest);
        }
    }

    const interests = await db.all<{interest: string}[]>('SELECT interest FROM user_interests WHERE user_id = ?', user.id);
    const updatedUser = { ...user, interests: interests.map(i => i.interest) };

    res.json(updatedUser);
}));

const deleteAccountSchema = z.object({ password: z.string() });
router.delete('/users/me', authenticate, asyncHandler(async(req, res) => {
    const { password } = deleteAccountSchema.parse(req.body);
    const userId = req.user!.id;
    const user = await db.get('SELECT password_hash FROM users WHERE id = ?', userId);

    if (!user || !(await comparePassword(password, user.password_hash))) {
        throw new AppError('Incorrect password.', 403);
    }
    
    await db.run('DELETE FROM users WHERE id = ?', userId);
    res.status(204).send();
}));

router.get('/users/me/stats', authenticate, asyncHandler(async(req, res) => {
    const userId = req.user!.id;
    const posts = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM posts WHERE user_id = ?', userId);
    const projects = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM project_members WHERE user_id = ?', userId);
    const stats: UserStats = { posts: posts?.count ?? 0, projects: projects?.count ?? 0, reviews: 0, citations: 0 };
    res.json(stats);
}));

// --- Post & Bookmark Routes ---
const mapPostData = (postsData: any[]): Post[] => {
    return postsData.map((p: any) => ({
        id: p.id,
        content: p.content,
        category: p.category,
        timestamp: p.timestamp,
        author: { id: p.authorId, name: p.authorName, handle: p.authorHandle, avatarUrl: p.authorAvatarUrl },
        likes: p.likesCount,
        comments: p.commentsCount,
        isLiked: !!p.isLiked,
        isBookmarked: !!p.isBookmarked,
    }));
};

const POST_DETAILS_QUERY = `
    SELECT
        p.id, p.content, p.category, p.created_at AS timestamp,
        u.id AS authorId, u.name AS authorName, u.handle AS authorHandle, u.avatarUrl AS authorAvatarUrl,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likesCount,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS commentsCount,
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) AS isLiked,
        EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = ?) AS isBookmarked
    FROM posts p JOIN users u ON p.user_id = u.id`;

router.get('/posts', authenticate, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const postsData = await db.all(`${POST_DETAILS_QUERY} ORDER BY p.created_at DESC`, [userId, userId]);
    res.json(mapPostData(postsData));
}));

router.get('/posts/category/:category', authenticate, asyncHandler(async (req, res) => {
    const { category } = req.params;
    const userId = req.user!.id;
    if (!Object.values(CommunityCategory).includes(category as CommunityCategory)) {
        throw new AppError('Invalid category specified.', 400);
    }
    const postsData = await db.all(`${POST_DETAILS_QUERY} WHERE p.category = ? ORDER BY p.created_at DESC`, [userId, userId, category]);
    res.json(mapPostData(postsData));
}));

router.get('/posts/:postId', authenticate, asyncHandler(async(req, res) => {
    const { postId } = req.params;
    const userId = req.user!.id;
    const postData = await db.get(`${POST_DETAILS_QUERY} WHERE p.id = ?`, [userId, userId, postId]);
    if (!postData) throw new AppError('Post not found.', 404);
    res.json(mapPostData([postData])[0]);
}));

router.get('/bookmarks', authenticate, asyncHandler(async(req, res) => {
    const userId = req.user!.id;
    const postsData = await db.all(`
        ${POST_DETAILS_QUERY}
        JOIN bookmarks b ON p.id = b.post_id
        WHERE b.user_id = ?
        ORDER BY p.created_at DESC
    `, [userId, userId, userId]);
    res.json(mapPostData(postsData));
}));

const createPostSchema = z.object({ content: z.string().min(1), category: z.nativeEnum(CommunityCategory) });
router.post('/posts', authenticate, asyncHandler(async (req, res) => {
    const { content, category } = createPostSchema.parse(req.body);
    const user = req.user!;
    const newPost: Omit<Post, 'likes' | 'comments' | 'isLiked' | 'isBookmarked'> = {
        id: `post-${uuidv4()}`, author: user, content, category, timestamp: new Date().toISOString(),
    };
    await db.run('INSERT INTO posts (id, user_id, content, category, created_at) VALUES (?, ?, ?, ?, ?)',
        newPost.id, user.id, content, category, newPost.timestamp
    );
    const fullPost = { ...newPost, likes: 0, comments: 0, isLiked: false, isBookmarked: false };
    broadcast('new_post', fullPost);
    res.status(201).json(fullPost);
}));

router.post('/posts/:postId/like', authenticate, asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user!.id;
    const isLiked = await db.get('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?', postId, userId);

    if (isLiked) {
        await db.run('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', postId, userId);
    } else {
        await db.run('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', postId, userId);
        const post = await db.get('SELECT user_id FROM posts WHERE id = ?', postId);
        if (post) await createNotification(post.user_id, userId, 'like', 'liked your post.', `/posts/${postId}`);
    }
    const likes = await db.get('SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?', postId);
    res.json({ likes: likes.count, isLiked: !isLiked });
}));

router.post('/posts/:postId/bookmark', authenticate, asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user!.id;
    const isBookmarked = await db.get('SELECT 1 FROM bookmarks WHERE post_id = ? AND user_id = ?', postId, userId);

    if (isBookmarked) {
        await db.run('DELETE FROM bookmarks WHERE post_id = ? AND user_id = ?', postId, userId);
    } else {
        await db.run('INSERT INTO bookmarks (post_id, user_id) VALUES (?, ?)', postId, userId);
    }
    res.json({ isBookmarked: !isBookmarked });
}));

// --- Comment Routes ---
router.get('/posts/:postId/comments', authenticate, asyncHandler(async (req, res) => {
    const comments = await db.all(`
        SELECT c.*, u.name as authorName, u.handle as authorHandle, u.avatarUrl as authorAvatarUrl
        FROM comments c JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ? ORDER BY c.created_at ASC
    `, req.params.postId);

    res.json(comments.map((c: any) => ({
        id: c.id, content: c.content, timestamp: c.created_at,
        author: { id: c.user_id, name: c.authorName, handle: c.authorHandle, avatarUrl: c.authorAvatarUrl }
    })));
}));

router.post('/posts/:postId/comments', authenticate, asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const content = req.body.content;
    const user = req.user!;
    const newComment: Comment = { id: `comment-${uuidv4()}`, author: user, content, timestamp: new Date().toISOString() };
    await db.run('INSERT INTO comments (id, post_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
        newComment.id, postId, user.id, content, newComment.timestamp
    );
    
    const postOwner = await db.get('SELECT user_id FROM posts WHERE id = ?', postId);
    if (postOwner) await createNotification(postOwner.user_id, user.id, 'comment', 'commented on your post.', `/posts/${postId}`);

    broadcast('new_comment', { postId, comment: newComment });
    res.status(201).json(newComment);
}));

// --- Project Routes ---
router.post('/projects', authenticate, asyncHandler(async (req, res) => {
    const payload: CreateProjectPayload = req.body;
    const user = req.user!;
    const newProject: Project = {
        id: `proj-${uuidv4()}`, title: payload.title, description: payload.description, tags: payload.tags,
        seekingCivilianScientists: payload.seekingCivilianScientists, isSeekingFunding: payload.isSeekingFunding,
        status: 'Recruiting', members: [{...user, projectRole: 'Lead'}], progress: 0,
    };
    
    await db.run('INSERT INTO projects (id, title, description, status, isSeekingFunding, seekingCivilianScientists, progress) VALUES (?, ?, ?, ?, ?, ?, ?)',
        newProject.id, newProject.title, newProject.description, newProject.status, newProject.isSeekingFunding, newProject.seekingCivilianScientists, newProject.progress
    );
    await db.run('INSERT INTO project_members (project_id, user_id, projectRole) VALUES (?, ?, ?)', newProject.id, user.id, 'Lead');
    for (const tag of newProject.tags) {
        await db.run('INSERT INTO project_tags (project_id, tag) VALUES (?, ?)', newProject.id, tag);
    }
    res.status(201).json(newProject);
}));

router.get('/projects/mine', authenticate, asyncHandler(async(req, res) => {
    const userId = req.user!.id;
    const projectsData = await db.all(`
        SELECT p.* FROM projects p JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = ? ORDER BY p.id DESC
    `, userId);

    if (projectsData.length === 0) return res.json([]);
    const projectIds = projectsData.map(p => p.id);
    const placeholders = projectIds.map(() => '?').join(',');

    const membersData = await db.all(`
        SELECT u.id, u.name, u.handle, u.avatarUrl, pm.project_id, pm.projectRole FROM users u
        JOIN project_members pm ON u.id = pm.user_id WHERE pm.project_id IN (${placeholders})
    `, projectIds);
    const tagsData = await db.all(`SELECT project_id, tag FROM project_tags WHERE project_id IN (${placeholders})`, projectIds);

    const membersByProjectId = membersData.reduce((acc, member) => {
        (acc[member.project_id] = acc[member.project_id] || []).push({
            id: member.id, name: member.name, handle: member.handle, avatarUrl: member.avatarUrl, projectRole: member.projectRole,
        });
        return acc;
    }, {});
    const tagsByProjectId = tagsData.reduce((acc, tag) => {
        (acc[tag.project_id] = acc[tag.project_id] || []).push(tag.tag);
        return acc;
    }, {});

    const projects = projectsData.map(p => ({
        ...p, isSeekingFunding: !!p.isSeekingFunding, seekingCivilianScientists: !!p.seekingCivilianScientists,
        members: membersByProjectId[p.id] || [], tags: tagsByProjectId[p.id] || [],
    }));
    res.json(projects);
}));

// --- Notification Routes ---
router.get('/notifications', authenticate, asyncHandler(async(req, res) => {
    const userId = req.user!.id;
    const notifications = await db.all(`
        SELECT n.*, u.name as senderName, u.handle as senderHandle, u.avatarUrl as senderAvatarUrl 
        FROM notifications n JOIN users u ON n.sender_id = u.id
        WHERE n.recipient_id = ? ORDER BY n.timestamp DESC LIMIT 20
    `, userId);
    res.json(notifications.map((n: any) => ({
        id: n.id, type: n.type, content: n.content, timestamp: n.timestamp, isRead: !!n.isRead, link: n.link,
        sender: { id: n.sender_id, name: n.senderName, handle: n.senderHandle, avatarUrl: n.senderAvatarUrl }
    })));
}));

router.post('/notifications/read-all', authenticate, asyncHandler(async(req, res) => {
    await db.run('UPDATE notifications SET isRead = 1 WHERE recipient_id = ?', req.user!.id);
    res.status(204).send();
}));


// --- Misc Routes (Events, KB, Funding, Reports) ---
router.get('/events', authenticate, (req, res) => res.json([]));
router.post('/events', authenticate, (req, res) => {
    const payload: CreateEventPayload = req.body;
    const newEvent: Event = { id: `event-${uuidv4()}`, ...payload, attendees: [] };
    res.status(201).json(newEvent);
});
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

// --- Gemini Proxy Routes ---
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
