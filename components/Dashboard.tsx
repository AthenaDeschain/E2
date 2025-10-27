import React from 'react';
import { CommunityCategory } from '../types';
import { COMMUNITY_CATEGORIES } from '../constants';
import { postService } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { draftPostWithAI } from '../services/geminiService';
import apiService from '../services/apiService';

const Dashboard: React.FC<{ onSelectCommunity: (category: CommunityCategory) => void }> = ({ onSelectCommunity }) => {

    const categoryIcons: { [key in CommunityCategory]: string } = {
        [CommunityCategory.INQUIRY]: '❓',
        [CommunityCategory.DISCOVERY]: '💡',
        [CommunityCategory.EXPERIMENT]: '🧪',
        [CommunityCategory.VALIDATE]: '✅',
        [CommunityCategory.IMPLEMENT]: '🚀',
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Communities</h1>
                    <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                        Engage in discussions structured around the scientific method. Select a community to join the conversation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {COMMUNITY_CATEGORIES.map(category => (
                        <div 
                            key={category.name} 
                            onClick={() => onSelectCommunity(category.name)} 
                            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 cursor-pointer"
                        >
                            <span className="text-5xl mb-4">{categoryIcons[category.name]}</span>
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{category.name}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm flex-grow">{category.description}</p>
                            <span className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400">Join Conversation &rarr;</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
