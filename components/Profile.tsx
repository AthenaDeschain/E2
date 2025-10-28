import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserStats } from '../types';
import EditProfileModal from './modals/EditProfileModal';
import apiService from '../services/apiService';

const Profile: React.FC = () => {
    const { user, setUser } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [stats, setStats] = useState<UserStats | null>(null);
    
    useEffect(() => {
        const fetchStats = async () => {
            if (user) {
                try {
                    const userStats = await apiService<UserStats>('/users/me/stats');
                    setStats(userStats);
                } catch (error) {
                    console.error("Failed to fetch user stats:", error);
                    setStats(null);
                }
            }
        };
        fetchStats();
    }, [user]);
    
    if (!user) {
        return <div>Loading profile...</div>;
    }

    const handleProfileUpdate = (updatedUser: User) => {
        if(setUser) {
            setUser(updatedUser);
        }
        setIsEditModalOpen(false);
    };

    return (
        <>
            {isEditModalOpen && user && (
                <EditProfileModal
                    user={user}
                    onClose={() => setIsEditModalOpen(false)}
                    onProfileUpdated={handleProfileUpdate}
                />
            )}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                            <img className="h-32 w-32 rounded-full ring-4 ring-white dark:ring-slate-800" src={user.avatarUrl} alt={user.name} />
                            <div className="mt-4 sm:mt-0 sm:ml-6">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                                <p className="text-lg text-slate-500 dark:text-slate-400">@{user.handle}</p>
                                <span className="mt-2 inline-block px-3 py-1 text-sm font-semibold rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">
                                    {user.role || 'Scientist'}
                                </span>
                                <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-300">
                                    {user.bio || 'No biography provided.'}
                                </p>
                                <button onClick={() => setIsEditModalOpen(true)} className="mt-4 px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats ? (
                             Object.entries(stats).map(([key, value]) => (
                                <div key={key} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-5 text-center">
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">{key}</p>
                                </div>
                            ))
                        ) : (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-5 text-center animate-pulse">
                                    <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mx-auto"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto mt-2"></div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Interests and Skills */}
                    <div className="mt-6 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-8">
                         <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Interests & Skills</h2>
                         {user.interests && user.interests.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {user.interests.map(interest => (
                                    <span key={interest} className="text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                         ) : (
                             <p className="text-slate-500">No interests listed. Edit your profile to add some!</p>
                         )}
                    </div>

                </div>
            </div>
        </>
    );
};

export default Profile;