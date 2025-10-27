import React, { useState, useEffect, useCallback } from 'react';
import { Comment, NewCommentPayload } from '../../types';
import { commentService } from '../../services/commentService';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useSocket } from '../../contexts/SocketContext';

interface CommentSectionProps {
    postId: string;
    onCommentAdded: () => void;
}

const CommentCard: React.FC<{ comment: Comment }> = ({ comment }) => (
    <div className="flex items-start space-x-3">
        <img src={comment.author.avatarUrl} alt={comment.author.name} className="h-9 w-9 rounded-full" />
        <div className="flex-1">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{comment.author.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 pl-3">{comment.timestamp}</span>
        </div>
    </div>
);


const CommentSection: React.FC<CommentSectionProps> = ({ postId, onCommentAdded }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const socket = useSocket();
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            setIsLoading(true);
            try {
                const fetchedComments = await commentService.getCommentsForPost(postId);
                setComments(fetchedComments);
            } catch (err) {
                setError("Could not load comments.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchComments();
    }, [postId]);

    const handleRealtimeComment = useCallback((payload: NewCommentPayload) => {
        if (payload.postId === postId) {
            setComments(prev => [...prev, payload.comment]);
            onCommentAdded();
        }
    }, [postId, onCommentAdded]);

    useEffect(() => {
        socket.subscribe('new_comment', handleRealtimeComment);
        return () => {
            socket.unsubscribe('new_comment', handleRealtimeComment);
        };
    }, [socket, handleRealtimeComment]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;
        
        setIsSubmitting(true);
        try {
            // The backend will broadcast this via WebSocket. The UI will update via handleRealtimeComment.
            await commentService.addCommentToPost(postId, newComment);
            setNewComment('');
            addToast('Comment posted!', 'success');
        } catch (err: any) {
            addToast(err.message || "Failed to post comment.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    const renderContent = () => {
        if (isLoading) return <LoadingSpinner />;
        if (error) return <p className="text-sm text-red-500">{error}</p>;
        if (comments.length === 0) return <p className="text-sm text-slate-500 dark:text-slate-400">No comments yet. Be the first to reply!</p>;
        
        return (
            <div className="space-y-4">
                {comments.map(comment => <CommentCard key={comment.id} comment={comment} />)}
            </div>
        )
    };

    return (
        <div className="border-t border-slate-200 dark:border-slate-700 p-6 space-y-4">
            {renderContent()}
            {user && (
                <div className="flex items-start space-x-3 pt-4">
                    <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full" />
                    <form onSubmit={handleSubmitComment} className="flex-1">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            disabled={isSubmitting}
                            className="w-full text-sm bg-slate-100 dark:bg-slate-700 border-transparent rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                         {/* A submit button could be added here if desired */}
                    </form>
                </div>
            )}
        </div>
    );
};

export default CommentSection;