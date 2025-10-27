import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { postService } from '../services/postService';
import LoadingSpinner from './common/LoadingSpinner';
import { PostCard } from './posts/PostCard';


const Bookmarks: React.FC = () => {
    const [bookmarks, setBookmarks] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const fetchedBookmarks = await postService.getBookmarkedPosts();
                setBookmarks(fetchedBookmarks);
            } catch (err: any) {
                setError("Failed to load your bookmarks. The backend might be offline.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookmarks();
    }, []);

    const handleBookmarkToggle = (postId: string) => {
        // Optimistically remove the post from the view when un-bookmarked
        setBookmarks(prev => prev.filter(post => post.id !== postId));
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="py-16"><LoadingSpinner /></div>;
        }
        if (error) {
            return <div className="text-center py-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">{error}</div>;
        }
        if (bookmarks.length > 0) {
            return (
                 <div className="space-y-6">
                    {bookmarks.map(post => (
                        <PostCard key={post.id} post={post} onBookmarkToggle={handleBookmarkToggle} />
                    ))}
                 </div>
            );
        }
        return (
             <div className="text-center py-16 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                 <div className="text-5xl sm:text-6xl mb-4">🔖</div>
                <h3 className="mt-2 text-xl font-medium text-slate-900 dark:text-slate-200">No bookmarks yet</h3>
                <p className="mt-1 text-slate-500 dark:text-slate-400">You can save posts, projects, and articles for later.</p>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                 <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">My Bookmarks</h1>
                 {renderContent()}
            </div>
        </div>
    );
};

export default Bookmarks;