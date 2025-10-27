// This service now exclusively interacts with a live backend API.
// The mock logic has been removed as part of the transition to production.

const API_BASE_URL = '/api';

const apiService = async <T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body: any = null
): Promise<T> => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('eureka_jwt');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = { method, headers };
    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            // Try to parse error response from the backend, otherwise throw a generic error.
            const errorData = await response.json().catch(() => ({ message: `An unknown error occurred on endpoint ${endpoint}` }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Handle responses with no content (e.g., 204 No Content for a DELETE request)
        if (response.status === 204) {
            return null as T;
        }

        return await response.json() as T;
    } catch (error: any) {
        console.error(`API service error on ${method} ${API_BASE_URL}${endpoint}:`, error);
        // Re-throw the error so it can be caught by the calling function (e.g., in a component's try-catch block).
        throw error;
    }
};

export default apiService;