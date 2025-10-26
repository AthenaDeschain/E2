import React, { useState } from 'react';
import { User, Post, Project } from '../types';
import { mockPosts, mockProjects } from '../data/mockData';

const StatCard: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-center">
        <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
);

// Using a simplified PostCard for the profile feed
const ProfilePostCard: React.FC<{ post: Post }> = ({ post }) => (
    <div className="bg-white dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
        <p className="text-slate-700 dark:text-slate-300">{post.content}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{post.timestamp}</p>
    </div>
);

// Using a simplified ProjectCard for the profile
const ProfileProjectCard: React.FC<{ project: Project }> = ({ project }) => (
     <div className="bg-white dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
        <h4 className="font-bold text-slate-800 dark:text-slate-200">{project.title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{project.description.substring(0, 100)}...</p>
         <div className="flex flex-wrap gap-2 mt-3">
            {project.tags.map(tag => (
                <span key={tag} className="text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                    {tag}
                </span>
            ))}
        </div>
    </div>
);


const Profile: React.FC<{ user: User }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'Activity' | 'Projects' | 'About'>('Activity');

    const userPosts = mockPosts.filter(post => post.author.handle === user.handle);
    const userProjects = mockProjects.filter(project => project.members.some(member => member.handle === user.handle));

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Activity':
                return (
                    <div className="space-y-4">
                        {userPosts.length > 0 ? userPosts.map(post => <ProfilePostCard key={post.id} post={post} />) : <p>No activity yet.</p>}
                    </div>
                );
            case 'Projects':
                return (
                     <div className="space-y-4">
                        {userProjects.length > 0 ? userProjects.map(project => <ProfileProjectCard key={project.id} project={project} />) : <p>Not a member of any projects yet.</p>}
                    </div>
                );
            case 'About':
                return (
                    <div className="space-y-4 text-slate-600 dark:text-slate-300">
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Affiliation</h3>
                            <p>{user.affiliation || 'Not specified'}</p>
                        </div>
                         <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Skills & Interests</h3>
                            {user.skills && user.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {user.skills.map(skill => (
                                         <span key={skill} className="text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : <p>No skills listed.</p>}
                        </div>
                         <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Links</h3>
                            <ul className="list-disc list-inside">
                                {user.links?.website && <li><a href={user.links.website} className="text-blue-500 hover:underline">Personal Website</a></li>}
                                {user.links?.orcid && <li><a href={`https://orcid.org/${user.links.orcid}`} className="text-blue-500 hover:underline">ORCID</a></li>}
                            </ul>
                             {!user.links?.website && !user.links?.orcid && <p>No links provided.</p>}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                        <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full ring-4 ring-blue-500/50" />
                        <div className="sm:ml-6 mt-4 sm:mt-0">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                            <p className="text-md text-slate-500 dark:text-slate-400">@{user.handle}</p>
                            <p className="text-lg text-slate-700 dark:text-slate-300 mt-1">{user.title}</p>
                            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                user.role === 'Career Scientist' 
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                                    : 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300'
                            }`}>
                                {user.role}
                            </span>
                        </div>
                    </div>
                    <p className="mt-6 text-slate-600 dark:text-slate-400">{user.bio}</p>
                    {user.stats && (
                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <StatCard label="Projects" value={user.stats.projects} />
                            <StatCard label="Posts" value={user.stats.posts} />
                            <StatCard label="Contributions" value={user.stats.contributions} />
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="mt-6">
                    <div className="border-b border-slate-200 dark:border-slate-700">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto">
                            <button onClick={() => setActiveTab('Activity')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'Activity' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Activity</button>
                            <button onClick={() => setActiveTab('Projects')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'Projects' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Projects ({userProjects.length})</button>
                            <button onClick={() => setActiveTab('About')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'About' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>About</button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default Profile;