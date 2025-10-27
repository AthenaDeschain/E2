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
    getAllPosts: (): Promise<Post[]> => {
        return apiService<Post[]>('/posts');
    },
    getPostsByCategory: (category: CommunityCategory): Promise<Post[]> => {
        return apiService<Post[]>(`/posts/category/${category}`);
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
    getBookmarkedPosts: (): Promise<Post[]> => {
        return apiService<Post[]>('/bookmarks');
    },
};