import apiService from './apiService';
import { Project, CreateProjectPayload } from '../types';

export const projectService = {
    createProject: (data: CreateProjectPayload): Promise<Project> => {
        return apiService<Project>('/projects', 'POST', data);
    },
};
