import React, { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { useSocket } from '../../contexts/SocketContext';

const NotificationDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const socket = useSocket();

    useEffect(() => {
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const data = await notificationService.getNotifications();
                setNotifications(data);
            } catch (err: any) {
                setError(err.message || "Failed to load notifications.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const handleNewNotification = useCallback((newNotification: Notification) => {
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    useEffect(() => {
        socket.subscribe('new_notification', handleNewNotification);
        return () => socket.unsubscribe('new_notification', handleNewNotification);
    }, [socket, handleNewNotification]);

    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length === 0) return;

        const originalNotifications = [...notifications];
        setNotifications(notifications.map(n => ({...n, isRead: true})));

        try {
            await notificationService.markAllAsRead();
        } catch (error) {
            console.error("Failed to mark all as read");
            setNotifications(originalNotifications);
        }
    };
    
    const renderContent = () => {
        if(isLoading) return <div className="p-4"><LoadingSpinner /></div>
        if(error) return <div className="p-4 text-sm text-red-500">{error}</div>
        if(notifications.length === 0) return <div className="p-4 text-sm text-slate-500">No new notifications.</div>
        
        return (
             <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {notifications.map(notif => (
                    <li key={notif.id} className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-700 ${!notif.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <div className="flex items-start gap-3">
                            <img src={notif.sender.avatarUrl} alt={notif.sender.name} className="h-8 w-8 rounded-full" />
                            <div className="text-sm">
                                <p className="text-slate-800 dark:text-slate-200">
                                    <span className="font-semibold">{notif.sender.name}</span> {notif.content}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notif.timestamp}</p>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-20">
            <div className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notifications</h3>
                <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline">Mark all as read</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default NotificationDropdown;