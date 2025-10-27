import apiService from './apiService';
import { Project } from '../types';

export interface CreateProjectPayload {
    title: string;
    description: string;
    tags: string[];
    seekingCivilianScientists: boolean;
    isSeekingFunding: boolean;
}

export const projectService = {
    createProject: (data: CreateProjectPayload): Promise<Project> => {
        return apiService<Project>('/projects', 'POST', data);
    },
};
