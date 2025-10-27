import apiService from './apiService';
import { Comment } from '../types';

export const commentService = {
    getCommentsForPost: (postId: string): Promise<Comment[]> => {
        return apiService(`/posts/${postId}/comments`);
    },
    addCommentToPost: (postId: string, content: string): Promise<Comment> => {
        return apiService(`/posts/${postId}/comments`, 'POST', { content });
    },
};
