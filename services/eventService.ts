import apiService from './apiService';
import { Event, CreateEventPayload } from '../types';

export const eventService = {
    createEvent: (data: CreateEventPayload): Promise<Event> => {
        return apiService<Event>('/events', 'POST', data);
    },
};

// FIX: Export the CreateEventPayload type so it can be imported by components.
export type { CreateEventPayload };
