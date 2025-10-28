import { User } from '../types';
import apiService from './apiService';

const TOKEN_KEY = 'eureka_jwt';

interface AuthResponse {
    token: string;
    user: User;
}

export const authService = {
    login: async (email: string, password_unused: string): Promise<User> => {
        const { token, user } = await apiService<AuthResponse>('/auth/login', 'POST', { email, password: password_unused });
        localStorage.setItem(TOKEN_KEY, token);
        return user;
    },

    signup: async (name: string, email: string, password_unused: string): Promise<User> => {
        const { token, user } = await apiService<AuthResponse>('/auth/signup', 'POST', { name, email, password: password_unused });
        localStorage.setItem(TOKEN_KEY, token);
        return user;
    },

    logout: async (): Promise<void> => {
        // Call the backend to invalidate the token on the server-side (e.g., add to a blacklist).
        // This is important for security. We'll proceed with client-side cleanup even if this fails.
        try {
            await apiService('/auth/logout', 'POST');
        } catch (error) {
            console.warn("Failed to invalidate token on server during logout. This can happen if the server is offline.", error);
        } finally {
            localStorage.removeItem(TOKEN_KEY);
        }
    },

    verifySession: async (): Promise<User | null> => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            return null;
        }
        try {
            // This endpoint would validate the token and return the associated user
            const user = await apiService<User>('/auth/me', 'GET');
            return user;
        } catch (error) {
            console.error("Session verification failed:", error);
            localStorage.removeItem(TOKEN_KEY); // Token is invalid or expired, remove it
            return null;
        }
    },

    changePassword: async (payload: { currentPassword: string, newPassword: string }): Promise<void> => {
        return apiService('/auth/change-password', 'POST', payload);
    },

    deleteAccount: async (payload: { password: string }): Promise<void> => {
        return apiService('/users/me', 'DELETE', payload);
    },
};