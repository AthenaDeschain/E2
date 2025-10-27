import { User } from '../types';

const API_BASE_URL = '/api'; // In a real app, this would be in an env variable

const getAuthToken = (): string | null => {
    // In a real app, you might use secure cookies, but localStorage is fine for this structure.
    return localStorage.getItem('eureka_jwt');
};

const apiService = async <T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body: any = null
): Promise<T> => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `An unknown error occurred on endpoint ${endpoint}` }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Handle cases with no response body (e.g., 204 No Content)
        if (response.status === 204) {
            return null as T;
        }

        return await response.json() as T;
    } catch (error: any) {
        console.error(`API service error on ${method} ${endpoint}:`, error);
        throw error;
    }
};

export default apiService;
