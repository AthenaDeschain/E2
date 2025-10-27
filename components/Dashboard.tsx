import React, { useState, useEffect } from 'react';
import { Post, CommunityCategory, User } from '../types';
import { COMMUNITY_CATEGORIES } from '../constants';
import { postService } from '../services/postService';
import LoadingSpinner from './common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { draftPostWithAI } from '../services/geminiService';
import apiService from '../services/apiService';

// This component is also used by Bookmarks.tsx, so it should be exportable
export const PostCard: React.FC<{ post: Post, onBookmarkToggle?: (postId: string) => void }> = ({ post, onBookmarkToggle }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);

    const handleLikeToggle = async () => {
        const originalLiked = isLiked;
        const originalLikeCount = likeCount;
        setIsLiked(!originalLiked);
        setLikeCount(originalLiked ? originalLikeCount - 1 : originalLikeCount + 1);
        try {
            const response = await postService.toggleLike(post.id);
            setLikeCount(response.likes);
            setIsLiked(response.isLiked);
        } catch (error) {
            setIsLiked(originalLiked);
            setLikeCount(originalLikeCount);
            // Optionally show a toast notification for the error
        }
    };
    
    const handleBookmarkToggle = async () => {
        const originalBookmarked = isBookmarked;
        setIsBookmarked(!originalBookmarked);
        try {
            await postService.toggleBookmark(post.id);
            if (onBookmarkToggle) onBookmarkToggle(post.id);
        } catch (error) {
            setIsBookmarked(originalBookmarked);
        }
    };
    
    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
            <div className="p-6">
                <div className="flex items-start">
                    <img className="h-12 w-12 rounded-full" src={post.author.avatarUrl} alt={post.author.name} />
                    <div className="ml-4">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 dark:text-white">{post.author.name}</p>
                             <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">{post.category}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">@{post.author.handle} &middot; {post.timestamp}</p>
                    </div>
                </div>
                <p className="mt-4 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{post.content}</p>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <div className="flex space-x-6">
                    <button className="flex items-center space-x-2 hover:text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span>{post.comments} Comments</span>
                    </button>
                    <button onClick={handleLikeToggle} className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={isLiked ? "currentColor" : "none"} stroke="currentColor"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                        <span>{likeCount} Likes</span>
                    </button>
                </div>
                <button onClick={handleBookmarkToggle} className={`flex items-center space-x-2 transition-colors ${isBookmarked ? 'text-yellow-500' : 'hover:text-yellow-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 20 20" stroke="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                    <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
            </div>
        </div>
    );
};

const CreatePost: React.FC<{ onNewPost: (post: Post) => void }> = ({ onNewPost }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [activeCategory, setActiveCategory] = useState<CommunityCategory>(CommunityCategory.DISCOVERY);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const categoryInfo = COMMUNITY_CATEGORIES.find(c => c.name === activeCategory);

    const handleGeneratePost = async () => {
        if (!content.trim()) return;
        setIsGenerating(true);
        try {
            const response = await draftPostWithAI(content);
            setContent(response.text);
        } catch (err: any) {
            setError(err.message || "Failed to generate post draft.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const newPost = await postService.createPost({ content, category: activeCategory });
            onNewPost(newPost);
            setContent('');
        } catch (err: any) {
            setError(err.message || 'Failed to create post.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start">
                <img className="h-12 w-12 rounded-full" src={user.avatarUrl} alt={user.name} />
                <div className="ml-4 w-full">
                    <div className="mb-2">
                        <div className="flex flex-wrap gap-2">
                            {COMMUNITY_CATEGORIES.map(cat => (
                                <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${activeCategory === cat.name ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{categoryInfo?.description}</p>
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={categoryInfo?.placeholder}
                        className="w-full p-2 bg-slate-100 dark:bg-slate-700 border-transparent rounded-md min-h-[100px] resize-y focus:ring-2 focus:ring-blue-500"
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <div className="flex justify-end items-center mt-3 gap-4">
                        <button 
                            onClick={handleGeneratePost} 
                            disabled={isGenerating || !content.trim()}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            {isGenerating ? <LoadingSpinner/> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>}
                            Draft with AI
                        </button>
                        <button onClick={handleSubmit} disabled={isLoading || !content.trim()} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400">
                           {isLoading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Dashboard: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const fetchedPosts = await apiService<Post[]>('/posts');
                setPosts(fetchedPosts);
            } catch (err) {
                setError("Failed to load the feed. The backend might be offline.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const handleNewPost = (newPost: Post) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="py-16"><LoadingSpinner /></div>;
        }
        if (error) {
            return <div className="text-center py-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">{error}</div>;
        }
        if (posts.length > 0) {
            return (
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            );
        }
        return (
            <div className="text-center py-16 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                <h3 className="text-xl font-medium text-slate-900 dark:text-slate-200">The feed is quiet...</h3>
                <p className="mt-1 text-slate-500 dark:text-slate-400">Be the first to share a discovery or ask a question!</p>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <CreatePost onNewPost={handleNewPost} />
                <div className="my-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-300 dark:border-slate-700" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-slate-100 dark:bg-slate-900 px-2 text-sm text-slate-500 dark:text-slate-400">Community Feed</span>
                        </div>
                    </div>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default Dashboard;
