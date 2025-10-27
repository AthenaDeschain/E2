import React, { useState, useEffect } from 'react';
import { Post, CommunityCategory } from '../types';
import { COMMUNITY_CATEGORIES } from '../constants';
import { postService } from '../services/postService';
import LoadingSpinner from './common/LoadingSpinner';
import { PostCard } from './posts/PostCard';
import CreatePost from './posts/CreatePost';

// --- CommunityFeed Component ---
interface CommunityFeedProps {
    category: CommunityCategory;
    onBack: () => void;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ category, onBack }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const categoryInfo = COMMUNITY_CATEGORIES.find(c => c.name === category);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const fetchedPosts = await postService.getPostsByCategory(category);
                setPosts(fetchedPosts);
            } catch (err) {
                setError("Failed to load the feed. The backend might be offline.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [category]);

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
                <p className="mt-1 text-slate-500 dark:text-slate-400">Be the first to share a discovery or ask a question in this category!</p>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <button onClick={onBack} className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Back to Communities
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{categoryInfo?.name}</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">{categoryInfo?.description}</p>
                </div>

                <CreatePost onNewPost={handleNewPost} category={category} />

                <div className="my-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-300 dark:border-slate-700" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-slate-100 dark:bg-slate-900 px-2 text-sm text-slate-500 dark:text-slate-400">{category} Feed</span>
                        </div>
                    </div>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default CommunityFeed;