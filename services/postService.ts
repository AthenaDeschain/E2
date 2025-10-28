import apiService from './apiService';
import { Post, CommunityCategory } from '../types';

interface CreatePostPayload {
    content: string;
    category: CommunityCategory;
}

// The API is expected to return the updated state of the entity
interface ToggleLikeResponse {
    likes: number;
    isLiked: boolean;
}

interface ToggleBookmarkResponse {
    isBookmarked: boolean;
}

export const postService = {
    getAllPosts: async (): Promise<Post[]> => {
        return await apiService<Post[]>('/posts');
    },
    getPostById: async (postId: string): Promise<Post> => {
        return await apiService<Post>(`/posts/${postId}`);
    },
    getPostsByCategory: async (category: CommunityCategory): Promise<Post[]> => {
        return await apiService<Post[]>(`/posts/category/${category}`);
    },
    createPost: (data: CreatePostPayload): Promise<Post> => {
        return apiService<Post>('/posts', 'POST', data);
    },
    toggleLike: (postId: string): Promise<ToggleLikeResponse> => {
        // A single POST endpoint is used to both like and unlike
        return apiService(`/posts/${postId}/like`, 'POST');
    },
    toggleBookmark: (postId: string): Promise<ToggleBookmarkResponse> => {
        // A single POST endpoint is used to both bookmark and un-bookmark
        return apiService(`/posts/${postId}/bookmark`, 'POST');
    },
    getBookmarkedPosts: async (): Promise<Post[]> => {
        return await apiService<Post[]>('/bookmarks');
    },
};