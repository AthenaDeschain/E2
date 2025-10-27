import React, { useState } from 'react';
import { Post } from '../../types';
import { postService } from '../../services/postService';
import { useToast } from '../../contexts/ToastContext';
import CommentSection from './CommentSection';

export const PostCard: React.FC<{ post: Post, onBookmarkToggle?: (postId: string) => void }> = ({ post, onBookmarkToggle }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(post.comments);
    const { addToast } = useToast();

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
            addToast('Failed to update like status.', 'error');
            setIsLiked(originalLiked);
            setLikeCount(originalLikeCount);
        }
    };
    
    const handleBookmarkToggle = async () => {
        const originalBookmarked = isBookmarked;
        setIsBookmarked(!originalBookmarked);
        try {
            await postService.toggleBookmark(post.id);
            if (onBookmarkToggle) onBookmarkToggle(post.id);
        } catch (error) {
            addToast('Failed to update bookmark status.', 'error');
            setIsBookmarked(originalBookmarked);
        }
    };

    const handleNewComment = () => {
        setCommentCount(prev => prev + 1);
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
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 hover:text-blue-600" aria-expanded={showComments}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span>{commentCount} Comments</span>
                    </button>
                    <button onClick={handleLikeToggle} className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`} aria-label="Like post">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={isLiked ? "currentColor" : "none"} stroke="currentColor"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                        <span>{likeCount} Likes</span>
                    </button>
                </div>
                <button onClick={handleBookmarkToggle} className={`flex items-center space-x-2 transition-colors ${isBookmarked ? 'text-yellow-500' : 'hover:text-yellow-500'}`} aria-label="Bookmark post">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 20 20" stroke="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                    <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
            </div>
             {showComments && <CommentSection postId={post.id} onCommentAdded={handleNewComment}/>}
        </div>
    );
};