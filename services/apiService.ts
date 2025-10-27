import {
    User, Post, Project, Event, CreateProjectPayload, CreateEventPayload, UpdateUserPayload
} from '../types';
import {
    mockUsers, mockProjects, mockPosts, mockEvents
} from '../data/mockData';

// This file is now a mock API service for development environments.
// It simulates backend responses and delays.

const PRODUCTION_HOSTNAME = 'eurekasquared.app';
const isProduction = window.location.hostname === PRODUCTION_HOSTNAME;

// Use a short delay to simulate network latency
const MOCK_API_DELAY = 300;

// --- In-memory "database" ---
// We deep copy to prevent mutations from carrying over between page loads in a real hot-reloading dev environment.
let postsDB: Post[] = JSON.parse(JSON.stringify(mockPosts));
let projectsDB: Project[] = JSON.parse(JSON.stringify(mockProjects));
let eventsDB: Event[] = JSON.parse(JSON.stringify(mockEvents));
const usersDB: User[] = JSON.parse(JSON.stringify(mockUsers));
// The logged-in user is hardcoded for the dev environment
const currentUser = usersDB[0];

const apiService = async <T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body: any = null
): Promise<T> => {

    if (isProduction) {
        // --- REAL API LOGIC FOR PRODUCTION ---
        const API_BASE_URL = '/api';
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
                const errorData = await response.json().catch(() => ({ message: `An unknown error occurred on endpoint ${endpoint}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            if (response.status === 204) return null as T;
            return await response.json() as T;
        } catch (error: any) {
            console.error(`API service error on ${method} ${endpoint}:`, error);
            throw error;
        }
    }

    // --- MOCK API LOGIC FOR DEVELOPMENT ---
    console.log(`[MOCK API] ${method} ${endpoint}`, body);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                // Auth Routes
                if (endpoint.startsWith('/auth')) {
                    if (endpoint === '/auth/login' || endpoint === '/auth/signup') {
                        resolve({ token: 'mock-jwt-token', user: currentUser } as T);
                        return;
                    }
                    if (endpoint === '/auth/me') {
                        resolve(currentUser as T);
                        return;
                    }
                }

                // Post Routes
                if (endpoint.startsWith('/posts/category/')) {
                    const category = endpoint.split('/')[3];
                    const filtered = postsDB.filter(p => p.category === category);
                    resolve(filtered as T);
                    return;
                }
                if (endpoint === '/posts' && method === 'GET') {
                    resolve(postsDB.sort((a,b) => (b.id.localeCompare(a.id))) as T); // newest first
                    return;
                }
                if (endpoint === '/posts' && method === 'POST') {
                    const newPost: Post = {
                        id: `post-${Date.now()}`,
                        author: currentUser,
                        content: body.content,
                        category: body.category,
                        timestamp: 'Just now',
                        likes: 0,
                        isLiked: false,
                        comments: 0,
                        isBookmarked: false,
                    };
                    postsDB.unshift(newPost);
                    resolve(newPost as T);
                    return;
                }
                if (endpoint.match(/\/posts\/.*\/like/) && method === 'POST') {
                    const postId = endpoint.split('/')[2];
                    const post = postsDB.find(p => p.id === postId);
                    if (post) {
                        post.isLiked = !post.isLiked;
                        post.likes += post.isLiked ? 1 : -1;
                        resolve({ likes: post.likes, isLiked: post.isLiked } as T);
                    } else {
                        reject(new Error('Post not found'));
                    }
                    return;
                }
                if (endpoint.match(/\/posts\/.*\/bookmark/) && method === 'POST') {
                    const postId = endpoint.split('/')[2];
                    const post = postsDB.find(p => p.id === postId);
                    if (post) {
                        post.isBookmarked = !post.isBookmarked;
                        resolve({ isBookmarked: post.isBookmarked } as T);
                    } else {
                        reject(new Error('Post not found'));
                    }
                    return;
                }
                if (endpoint === '/bookmarks' && method === 'GET') {
                    resolve(postsDB.filter(p => p.isBookmarked) as T);
                    return;
                }

                // Project Routes
                if (endpoint === '/projects/mine' && method === 'GET') {
                    resolve(projectsDB as T);
                    return;
                }
                if (endpoint === '/projects' && method === 'POST') {
                    const payload = body as CreateProjectPayload;
                    const newProject: Project = {
                        id: `proj-${Date.now()}`,
                        title: payload.title,
                        description: payload.description,
                        tags: payload.tags,
                        isSeekingFunding: payload.isSeekingFunding,
                        seekingCivilianScientists: payload.seekingCivilianScientists,
                        status: 'Recruiting',
                        progress: 0,
                        members: [{ ...currentUser, projectRole: 'Lead' }],
                    };
                    projectsDB.unshift(newProject);
                    resolve(newProject as T);
                    return;
                }

                // Event Routes
                if (endpoint === '/events' && method === 'GET') {
                    resolve(eventsDB.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) as T);
                    return;
                }
                if (endpoint === '/events' && method === 'POST') {
                    const payload = body as CreateEventPayload;
                    const newEvent: Event = {
                        id: `event-${Date.now()}`,
                        ...payload,
                        attendees: [currentUser],
                    };
                    eventsDB.push(newEvent);
                    resolve(newEvent as T);
                    return;
                }

                // User Routes
                if (endpoint === '/users/me' && method === 'PUT') {
                    const payload = body as UpdateUserPayload;
                    Object.assign(currentUser, payload);
                    const userToUpdate = usersDB.find(u => u.id === currentUser.id);
                    if (userToUpdate) {
                        Object.assign(userToUpdate, payload);
                    }
                    resolve(currentUser as T);
                    return;
                }

                // Gemini Proxy Routes (just return a simple response)
                if (endpoint.startsWith('/gemini')) {
                     if (endpoint === '/gemini/jargon-buster') {
                        resolve([
                            { term: 'Quantum Entanglement', definition: 'A phenomenon where two particles become linked and instantaneously affect each other, regardless of distance.' },
                            { term: 'Photonic Qubits', definition: 'Quantum bits of information encoded in single photons (particles of light).' },
                        ] as T);
                        return;
                    }
                    resolve({
                        text: `This is a mock AI response for **${endpoint}**. \n\n ### Input Received:\n \`\`\`json\n${JSON.stringify(body, null, 2)}\n\`\`\` \n\n In a real application, this would be a generative response tailored to the user's input.`,
                        sources: endpoint === '/gemini/research' ? [{ web: { uri: 'https://example.com/mock-source', title: 'Mock Source Paper' } }] : []
                    } as T);
                    return;
                }

                reject(new Error(`[MOCK API] Unhandled endpoint: ${method} ${endpoint}`));

            } catch (error) {
                console.error(`[MOCK API] Error processing ${method} ${endpoint}:`, error);
                reject(error);
            }
        }, MOCK_API_DELAY);
    });
};

export default apiService;