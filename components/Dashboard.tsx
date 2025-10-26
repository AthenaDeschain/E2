import React, { useState } from 'react';
import { mockPosts } from '../data/mockData';
import { Post, CommunityCategory, User } from '../types';
import { COMMUNITY_CATEGORIES } from '../constants';
import { draftPostWithAI, simplifyText } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
import Tooltip from './common/Tooltip';
import { useAuth } from '../contexts/AuthContext';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const [isSimplifying, setIsSimplifying] = useState(false);
    const [simplifiedContent, setSimplifiedContent] = useState<string | null>(null);

    const handleSimplify = async () => {
        setIsSimplifying(true);
        try {
            const response = await simplifyText(post.content);
            setSimplifiedContent(response.text);
        } catch (error) {
            console.error("Failed to simplify text:", error);
            setSimplifiedContent("Sorry, we couldn't simplify this text right now.");
        } finally {
            setIsSimplifying(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm transition-shadow hover:shadow-md">
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start">
                        <img className="h-12 w-12 rounded-full" src={post.author.avatarUrl} alt={post.author.name} />
                        <div className="ml-4">
                            <p className="font-bold text-slate-900 dark:text-white">{post.author.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">@{post.author.handle} &middot; {post.timestamp}</p>
                        </div>
                    </div>
                    <Tooltip tip={COMMUNITY_CATEGORIES.find(c => c.name === post.category)?.description || ''} position="top">
                         <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full cursor-help ${
                            post.category === CommunityCategory.INQUIRY ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            post.category === CommunityCategory.DISCOVERY ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            post.category === CommunityCategory.EXPERIMENT ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                            post.category === CommunityCategory.VALIDATE ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                            {post.category}
                        </span>
                    </Tooltip>
                </div>
                <div className="mt-4 text-slate-700 dark:text-slate-300 space-y-3">
                    <p>{post.content}</p>
                    {simplifiedContent && (
                        <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-md">
                            <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300">Simplified Explanation:</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">{simplifiedContent}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <div className="flex space-x-6">
                    <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-red-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-green-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                        <span className="hidden sm:inline">Share</span>
                    </button>
                </div>
                 <div className="flex items-center space-x-4">
                     <Tooltip tip="Use AI to explain complex terms in this post.">
                        <button onClick={handleSimplify} disabled={isSimplifying} className="flex items-center space-x-1.5 hover:text-purple-600 disabled:opacity-50 disabled:cursor-wait transition-colors">
                           {isSimplifying ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                           ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                           )}
                            <span className="hidden sm:inline">{isSimplifying ? 'Simplifying...' : 'Simplify'}</span>
                        </button>
                     </Tooltip>
                    <Tooltip tip="Save this post for later.">
                        <button className="hover:text-yellow-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        </button>
                    </Tooltip>
                 </div>
            </div>
        </div>
    );
};

const CreatePost: React.FC<{ onNewPost: (post: Post) => void }> = ({ onNewPost }) => {
    const [content, setContent] = useState('');
    const [topic, setTopic] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);
    const [category, setCategory] = useState<CommunityCategory>(CommunityCategory.INQUIRY);
    const { user } = useAuth();

    const handleDraftWithAI = async () => {
        if (!topic.trim()) return;
        setIsDrafting(true);
        try {
            const response = await draftPostWithAI(topic);
            setContent(response.text);
        } catch (error) {
            console.error("Failed to draft post with AI:", error);
        } finally {
            setIsDrafting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user) return;
        
        const newPost: Post = {
            id: `post-${Date.now()}`,
            author: user,
            content,
            timestamp: 'Just now',
            likes: 0,
            comments: 0,
            category,
        };
        onNewPost(newPost);
        setContent('');
        setTopic('');
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={COMMUNITY_CATEGORIES.find(c => c.name === category)?.placeholder || "Share your thoughts..."}
                    className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 transition"
                    rows={3}
                />
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-auto flex items-center gap-2">
                         <Tooltip tip="Provide a topic and let AI draft an engaging post for you.">
                            <div className="flex items-center gap-2">
                                 <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Or draft with AI..."
                                    className="w-full sm:w-auto p-2 text-sm bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                                />
                                <button type="button" onClick={handleDraftWithAI} disabled={isDrafting} className="p-2 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 flex items-center">
                                    {isDrafting ? <LoadingSpinner /> : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                                    )}
                                </button>
                            </div>
                        </Tooltip>
                    </div>
                    <div className="w-full sm:w-auto flex items-center justify-end gap-4">
                         <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as CommunityCategory)}
                            className="p-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                        >
                            {COMMUNITY_CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                        </select>
                        <button type="submit" className="px-6 py-2 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                            Post
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

interface DashboardProps {
    activeCategory: CommunityCategory;
}

const Dashboard: React.FC<DashboardProps> = ({ activeCategory }) => {
    const [posts, setPosts] = useState<Post[]>(mockPosts);

    const handleNewPost = (post: Post) => {
        setPosts(prevPosts => [post, ...prevPosts]);
    };

    const filteredPosts = posts.filter(post => post.category === activeCategory);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <CreatePost onNewPost={handleNewPost} />
                </div>
                
                <div className="space-y-6">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map(post => <PostCard key={post.id} post={post} />)
                    ) : (
                         <div className="text-center py-16 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19h18"></path></svg>
                            <h3 className="mt-2 text-xl font-medium text-slate-900 dark:text-slate-200">No posts in this community yet</h3>
                            <p className="mt-1 text-slate-500 dark:text-slate-400">Be the first to share something in the {activeCategory} community!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;