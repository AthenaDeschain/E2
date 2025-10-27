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

    logout: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        // In a real app, you might also want to call a '/api/auth/logout' endpoint 
        // to invalidate the token on the server side if you have a token blacklist.
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
    }
};
