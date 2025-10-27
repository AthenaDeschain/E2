import apiService from './apiService';
import { User, UpdateUserPayload } from '../types';

export const userService = {
    updateProfile: (data: UpdateUserPayload): Promise<User> => {
        return apiService<User>('/users/me', 'PUT', data);
    },
};

// FIX: Export the UpdateUserPayload type so it can be imported by components.
export type { UpdateUserPayload };
