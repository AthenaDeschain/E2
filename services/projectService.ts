import apiService from './apiService';
import { Project, CreateProjectPayload } from '../types';

export const projectService = {
    createProject: (data: CreateProjectPayload): Promise<Project> => {
        return apiService<Project>('/projects', 'POST', data);
    },
};

// FIX: Export the CreateProjectPayload type so it can be imported by components.
export type { CreateProjectPayload };
