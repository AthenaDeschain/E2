import apiService from './apiService';
import { User } from '../types';

export interface UpdateUserPayload {
    name?: string;
    bio?: string;
    interests?: string[];
}

export const userService = {
    updateProfile: (data: UpdateUserPayload): Promise<User> => {
        return apiService<User>('/users/me', 'PUT', data);
    },
};
