import React, { useState, useEffect } from 'react';
import { Post } from '../../types';
import { postService } from '../../services/postService';
import LoadingSpinner from '../common/LoadingSpinner';
import { PostCard } from './PostCard';

interface PostDetailViewProps {
    postId: string;
    onBack: () => void;
}

const PostDetailView: React.FC<PostDetailViewProps> = ({ postId, onBack }) => {
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedPost = await postService.getPostById(postId);
                setPost(fetchedPost);
            } catch (err: any) {
                setError(err.message || 'Failed to load post.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    const renderContent = () => {
        if (isLoading) return <div className="py-16"><LoadingSpinner /></div>;
        if (error) return <div className="text-center py-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">{error}</div>;
        if (!post) return <div className="text-center py-16">Post not found.</div>;
        return <PostCard post={post} />;
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={onBack} className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Back
                </button>
                {renderContent()}
            </div>
        </div>
    );
};

export default PostDetailView;
