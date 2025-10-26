import React from 'react';

const Bookmarks: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto text-center py-16">
                 <div className="text-5xl sm:text-6xl mb-4">🔖</div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">My Bookmarks</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">This feature is coming soon!</p>
                <p className="text-slate-500 dark:text-slate-500 mt-1">You'll be able to save posts, projects, and articles here.</p>
            </div>
        </div>
    );
};

export default Bookmarks;