import apiService from './apiService';
import { Event } from '../types';

export interface CreateEventPayload {
    title: string;
    date: string; // ISO 8601 format
    location: string;
    description: string;
    isOnline: boolean;
}

export const eventService = {
    createEvent: (data: CreateEventPayload): Promise<Event> => {
        return apiService<Event>('/events', 'POST', data);
    },
};
