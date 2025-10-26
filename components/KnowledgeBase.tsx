import React from 'react';

const CATEGORIES = [
    { name: 'Research Methodologies', icon: '🔬' },
    { name: 'Data Analysis & Viz', icon: '📊' },
    { name: 'Scientific Writing', icon: '✍️' },
    { name: 'Grant Proposals', icon: '📄' },
    { name: 'Lab Safety Protocols', icon: '☣️' },
    { name: 'Citizen Science', icon: '🧑‍🤝‍🧑' },
];

const CIVILIAN_SCIENTIST_GUIDES = [
    { name: 'What is a Hypothesis?', description: 'Learn the fundamentals of forming a testable scientific question.', icon: '🤔' },
    { name: 'How to Read a Scientific Paper', description: 'A step-by-step guide to tackling dense academic literature.', icon: '🧐' },
    { name: 'Understanding Peer Review', description: 'Discover how scientific research is validated by the community.', icon: '🧑‍⚖️' },
    { name: 'Data Collection 101', description: 'Best practices for keeping accurate and useful research records.', icon: '📓' },
];

const CAREER_SCIENTIST_GUIDES = [
    { name: 'How to Design a Citizen Science Project', description: 'A guide to creating engaging and impactful public research.', icon: '🏗️' },
    { name: 'Communicating Science to the Public', description: 'Techniques for making your research accessible and exciting.', icon: '🎤' },
    { name: 'Managing Collaborative Teams', description: 'Best practices for leading projects with diverse contributors.', icon: '🧩' },
    { name: 'Open Science & Data Sharing', description: 'Learn the importance and methods of making research transparent.', icon: '🌐' },
];

const KnowledgeBase: React.FC = () => {
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
                            <input
                                type="search"
                                placeholder="Search articles..."
                                className="w-full p-3 sm:p-4 pl-10 sm:pl-12 text-base sm:text-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b-2 border-teal-500 pb-2">For Civilian Scientists</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">New to scientific research? These guides are for you.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {CIVILIAN_SCIENTIST_GUIDES.map(guide => (
                            <div key={guide.name} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 flex items-start space-x-4 hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
                                <div className="text-4xl">{guide.icon}</div>
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{guide.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">{guide.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b-2 border-purple-500 pb-2">For Career Scientists</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Resources on public engagement, open science, and managing collaborative projects.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {CAREER_SCIENTIST_GUIDES.map(guide => (
                            <div key={guide.name} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 flex items-start space-x-4 hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
                                <div className="text-4xl">{guide.icon}</div>
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{guide.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">{guide.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b-2 border-blue-500 pb-2">All Categories</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {CATEGORIES.map(category => (
                            <div key={category.name} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
                                <span className="text-4xl sm:text-5xl mb-4">{category.icon}</span>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{category.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBase;