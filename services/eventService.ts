import apiService from './apiService';
import { Event, CreateEventPayload } from '../types';

export const eventService = {
    createEvent: (data: CreateEventPayload): Promise<Event> => {
        return apiService<Event>('/events', 'POST', data);
    },
};
