import React, { useState, useEffect, useMemo } from 'react';
import { KnowledgeBaseArticle } from '../types';
import apiService from '../services/apiService';
import LoadingSpinner from './common/LoadingSpinner';

const ArticleCard: React.FC<{ article: KnowledgeBaseArticle }> = ({ article }) => (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 flex items-start space-x-4 hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
        <div className="text-4xl">{article.icon}</div>
        <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{article.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{article.description}</p>
        </div>
    </div>
);


const KnowledgeBase: React.FC = () => {
    const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const fetchedArticles = await apiService<KnowledgeBaseArticle[]>('/knowledge-base/articles');
                setArticles(fetchedArticles);
            } catch (err) {
                setError('Failed to load knowledge base articles. The backend might be offline.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchArticles();
    }, []);

    const filteredArticles = useMemo(() => {
        if (!searchTerm) {
            return articles;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return articles.filter(article => 
            article.title.toLowerCase().includes(lowercasedTerm) ||
            article.description.toLowerCase().includes(lowercasedTerm)
        );
    }, [articles, searchTerm]);

    const groupedArticles = useMemo(() => {
        return filteredArticles.reduce((acc, article) => {
            const { audience } = article;
            if (!acc[audience]) {
                acc[audience] = [];
            }
            acc[audience].push(article);
            return acc;
        }, {} as Record<KnowledgeBaseArticle['audience'], KnowledgeBaseArticle[]>);
    }, [filteredArticles]);


    const renderContent = () => {
        if (isLoading) {
            return <div className="py-16"><LoadingSpinner /></div>;
        }
        if (error) {
            return <div className="text-center py-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">{error}</div>;
        }
        const hasResults = Object.keys(groupedArticles).length > 0;
        if (!hasResults) {
            return <div className="text-center py-16 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                 <h3 className="text-xl font-medium text-slate-900 dark:text-slate-200">No articles found</h3>
                 <p className="mt-1 text-slate-500 dark:text-slate-400">No articles matched your search term "{searchTerm}".</p>
            </div>;
        }
        return (
            <>
                {groupedArticles['Civilian Scientist'] && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b-2 border-teal-500 pb-2">For Civilian Scientists</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">New to scientific research? These guides are for you.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {groupedArticles['Civilian Scientist'].map(article => <ArticleCard key={article.id} article={article} />)}
                        </div>
                    </div>
                )}
                {groupedArticles['Career Scientist'] && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b-2 border-purple-500 pb-2">For Career Scientists</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">Resources on public engagement, open science, and managing collaborative projects.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {groupedArticles['Career Scientist'].map(article => <ArticleCard key={article.id} article={article} />)}
                        </div>
                    </div>
                )}
                {groupedArticles['General'] && (
                     <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b-2 border-blue-500 pb-2">General Resources</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groupedArticles['General'].map(article => (
                                 <div key={article.id} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
                                     <span className="text-4xl sm:text-5xl mb-4">{article.icon}</span>
                                     <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{article.title}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        )
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Knowledge Base</h1>
                    <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                        Your central hub for guides, protocols, and best practices for career and civilian scientists.
                    </p>
                    <div className="mt-6 max-w-xl mx-auto">
                        <div className="relative">
                            <label htmlFor="kb-search" className="sr-only">Search articles</label>
                            <input
                                id="kb-search"
                                type="search"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 sm:p-4 pl-10 sm:pl-12 text-base sm:text-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default KnowledgeBase;