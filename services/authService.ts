import { mockUsers, addUser } from '../data/mockData';
import { User } from '../types';

const USER_SESSION_KEY = 'eureka_user_handle';

export const authService = {
    login: async (email: string, password_unused: string): Promise<User> => {
        // In a real app, you'd validate the password. Here we just find by email.
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        const user = Object.values(mockUsers).find(u => u.email === email);
        if (user) {
            localStorage.setItem(USER_SESSION_KEY, user.handle);
            return Promise.resolve(user);
        } else {
            return Promise.reject(new Error('Invalid email or password'));
        }
    },

    signup: async (name: string, email: string, password_unused: string): Promise<User> => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        if (Object.values(mockUsers).some(u => u.email === email)) {
            return Promise.reject(new Error('User with this email already exists'));
        }
        const handle = name.toLowerCase().replace(/\s+/g, '_') + `_${Date.now() % 1000}`;
        const newUser: User = {
            name,
            email,
            password: 'mock_password', // In a real app, you'd hash this.
            handle,
            avatarUrl: `https://i.pravatar.cc/150?u=${handle}`,
            title: 'New Member',
            role: 'Civilian Scientist',
            stats: { projects: 0, posts: 0, contributions: 0 },
        };
        addUser(newUser); // Add to our mock DB
        localStorage.setItem(USER_SESSION_KEY, newUser.handle);
        return Promise.resolve(newUser);
    },

    logout: (): void => {
        localStorage.removeItem(USER_SESSION_KEY);
    },

    getCurrentUser: (): User | null => {
        const handle = localStorage.getItem(USER_SESSION_KEY);
        if (handle) {
            const user = Object.values(mockUsers).find(u => u.handle === handle);
            return user || null;
        }
        return null;
    }
};