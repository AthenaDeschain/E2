import { GeminiResponse, JargonDefinition } from '../types';
import apiService from './apiService';

type Audience = 'Academic' | 'Public';

// Generic proxy function to call our backend, which will then call the Gemini API
const callGeminiProxy = <T>(endpoint: string, payload: object): Promise<T> => {
    return apiService<T>(`/gemini${endpoint}`, 'POST', payload);
};

// --- Writing Workbench Functions ---

export const getResearchAndCitations = (topic: string): Promise<GeminiResponse> => {
    return callGeminiProxy<GeminiResponse>('/research', { topic });
};

export const validateOriginality = (text: string): Promise<GeminiResponse> => {
    return callGeminiProxy<GeminiResponse>('/originality', { text });
};

export const updateLanguage = (text: string, audience: Audience): Promise<GeminiResponse> => {
    return callGeminiProxy<GeminiResponse>('/language', { text, audience });
};

export const performRigorousReview = (text: string, audience: Audience): Promise<GeminiResponse> => {
    return callGeminiProxy<GeminiResponse>('/review', { text, audience });
};

// --- Guided Writing Process Functions ---

export const refineIdea = (idea: string): Promise<GeminiResponse> => {
    return callGeminiProxy<GeminiResponse>('/refine-idea', { idea });
};

export const createOutline = (idea: string): Promise<GeminiResponse> => {
    return callGeminiProxy<GeminiResponse>('/create-outline', { idea });
};

export const suggestJournals = (abstract: string): Promise<GeminiResponse> => {
    return callGeminiProxy<GeminiResponse>('/suggest-journals', { abstract });
};

// --- Social & Accessibility Functions ---
export const draftPostWithAI = (topic: string): Promise<GeminiResponse> => {
    return callGeminiProxy<GeminiResponse>('/draft-post', { topic });
};

export const simplifyText = (text: string): Promise<GeminiResponse> => {
    return callGeminiProxy<GeminiResponse>('/simplify', { text });
};

export const rewritePostForAudience = (text: string, audience: Audience): Promise<GeminiResponse> => {
    return callGeminiProxy<GeminiResponse>('/rewrite-post', { text, audience });
};

export const bustJargon = (text: string): Promise<JargonDefinition[]> => {
    return callGeminiProxy<JargonDefinition[]>('/jargon-buster', { text });
};
