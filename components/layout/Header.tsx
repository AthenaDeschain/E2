import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { useSocket } from '../../contexts/SocketContext';
import { Notification, Page } from '../../types';

interface HeaderProps {
    setCurrentPage: (page: Page) => void;
    navigateToPost: (link: string) => void;
}

const Header: React.FC<HeaderProps> = ({ setCurrentPage, navigateToPost }) => {
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const socket = useSocket();

    const profileRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNewNotification = useCallback((notification: Notification) => {
        setHasUnread(true);
    }, []);

    useEffect(() => {
        socket.subscribe('new_notification', handleNewNotification);
        return () => socket.unsubscribe('new_notification', handleNewNotification);
    }, [socket, handleNewNotification]);

    const onOpenNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
        if (!isNotificationsOpen) {
            setHasUnread(false);
        }
    };

    const handleNavigateToSettings = () => {
        setCurrentPage(Page.SETTINGS);
        setIsProfileOpen(false);
    };

    const handleLogout = async () => {
        setIsProfileOpen(false);
        await logout();
    };

    const handleNotificationClick = (link: string) => {
        navigateToPost(link);
        setIsNotificationsOpen(false);
    };

    if (!user) return null;

    return (
        <header className="flex-shrink-0 bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-end px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                    <button 
                        onClick={onOpenNotifications} 
                        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" 
                        aria-haspopup="true"
                        aria-expanded={isNotificationsOpen}
                        aria-label={hasUnread ? "View notifications (unread)" : "View notifications"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        {hasUnread && (
                           <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800/50" aria-hidden="true"></span>
                        )}
                    </button>
                    {isNotificationsOpen && <NotificationDropdown onNotificationClick={handleNotificationClick} />}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)} 
                        className="flex items-center gap-2"
                        aria-haspopup="true"
                        aria-expanded={isProfileOpen}
                    >
                        <img className="h-9 w-9 rounded-full" src={user.avatarUrl} alt={user.name} />
                        <span className="hidden sm:inline font-semibold">{user.name}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-10">
                             <button onClick={handleNavigateToSettings} className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Settings</button>
                             <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Log out</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;