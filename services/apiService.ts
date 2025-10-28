// This service now exclusively interacts with a live backend API.
// The mock logic has been removed as part of the transition to production.

// Check if the app is running on a local development server.
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname.startsWith('127.');

// Use an environment variable if provided. Otherwise, use '/api' prefix for local development
// to support proxying, and use no prefix for production environments (like Cloud Run)
// where the API is expected to be served from the root.
const API_BASE_URL = process.env.API_URL || (isLocalhost ? '/api' : '');


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
        const fullUrl = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(fullUrl, config);
        
        if (!response.ok) {
            // Try to parse error response from the backend, otherwise throw a generic error.
            const errorData = await response.json().catch(() => ({ message: `Request to ${fullUrl} failed with status ${response.status}. The server's response was not valid JSON. This often happens with configuration errors (e.g., CORS, incorrect API URL) or server crashes.` }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Handle responses with no content (e.g., 204 No Content for a DELETE request)
        if (response.status === 204) {
            return null as T;
        }

        return await response.json() as T;
    } catch (error: any) {
        // The calling service (e.g., postService) is responsible for logging and handling the error.
        // This prevents double-logging and reduces console noise for gracefully-handled errors.
        throw error;
    }
};

export default apiService;