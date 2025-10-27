import apiService from './apiService';
import { Notification } from '../types';

export const notificationService = {
    getNotifications: (): Promise<Notification[]> => {
        return apiService('/notifications');
    },
    markAsRead: (notificationId: string): Promise<void> => {
        return apiService(`/notifications/${notificationId}/read`, 'POST');
    },
    markAllAsRead: (): Promise<void> => {
        return apiService('/notifications/read-all', 'POST');
    },
};
