import React, { useState, useEffect, useCallback } from 'react';
import { Post } from '../types';
import { postService } from '../services/postService';
import LoadingSpinner from './common/LoadingSpinner';
import { PostCard } from './posts/PostCard';
import CreatePost from './posts/CreatePost';
import { useSocket } from '../contexts/SocketContext';

const GlobalFeed: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const socket = useSocket();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const fetchedPosts = await postService.getAllPosts();
                setPosts(fetchedPosts);
            } catch (err) {
                setError("Failed to load the feed. The backend might be offline.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const handleRealtimePost = useCallback((newPost: Post) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    }, []);

    useEffect(() => {
        socket.subscribe('new_post', handleRealtimePost);
        return () => {
            socket.unsubscribe('new_post', handleRealtimePost);
        };
    }, [socket, handleRealtimePost]);


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
                <h3 className="text-xl font-medium text-slate-900 dark:text-slate-200">Welcome to Eureka²!</h3>
                <p className="mt-1 text-slate-500 dark:text-slate-400">The feed is empty. Start the conversation by creating the first post.</p>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Global Feed</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">The latest posts from all communities across the platform.</p>
                </div>

                <CreatePost />

                <div className="my-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-300 dark:border-slate-700" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-slate-100 dark:bg-slate-900 px-2 text-sm text-slate-500 dark:text-slate-400">All Posts</span>
                        </div>
                    </div>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default GlobalFeed;