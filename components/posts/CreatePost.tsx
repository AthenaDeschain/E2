import React, { useState } from 'react';
import { Post, CommunityCategory } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { postService } from '../../services/postService';
import { draftPostWithAI } from '../../services/geminiService';
import { COMMUNITY_CATEGORIES } from '../../constants';
import LoadingSpinner from '../common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

const CreatePost: React.FC<{ category?: CommunityCategory }> = ({ category }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { addToast } = useToast();
    
    // If a category is passed as a prop, use it. Otherwise, default to the first category for the selector.
    const [selectedCategory, setSelectedCategory] = useState<CommunityCategory>(category || COMMUNITY_CATEGORIES[0].name);

    const categoryInfo = COMMUNITY_CATEGORIES.find(c => c.name === selectedCategory);

    const handleGeneratePost = async () => {
        if (!content.trim()) return;
        setIsGenerating(true);
        setError(null);
        try {
            const response = await draftPostWithAI(content);
            setContent(response.text);
            addToast('AI draft generated!', 'info');
        } catch (err: any) {
            const errorMessage = err.message || "Failed to generate post draft.";
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            await postService.createPost({ content, category: selectedCategory });
            addToast('Post created successfully!', 'success');
            setContent('');
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to create post.';
            setError(errorMessage);
            addToast(errorMessage, 'error');
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
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={categoryInfo?.placeholder}
                        className="w-full p-2 bg-slate-100 dark:bg-slate-700 border-transparent rounded-md min-h-[100px] resize-y focus:ring-2 focus:ring-blue-500"
                    />
                     {/* Show category selector only if no category prop is passed */}
                     {!category && (
                        <div className="mt-2">
                             <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value as CommunityCategory)}
                                className="w-full sm:w-auto p-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                             >
                                 {COMMUNITY_CATEGORIES.map(cat => (
                                     <option key={cat.name} value={cat.name}>Post in: {cat.name}</option>
                                 ))}
                             </select>
                        </div>
                    )}
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

export default CreatePost;