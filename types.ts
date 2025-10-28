export enum Page {
    PROFILE = 'Profile',
    FEED = 'Feed',
    COMMUNITIES = 'Communities',
    MY_PROJECTS = 'My Projects',
    BOOKMARKS = 'Bookmarks',
    TOOLS = 'Tools',
    KNOWLEDGE_BASE = 'Knowledge Base',
    EVENTS = 'Events',
    FUNDING = 'Funding',
    SETTINGS = 'Settings',
}

export enum WritingTool {
    WORKBENCH = 'Writing Workbench',
    GUIDED_WRITING = 'Guided Writing',
    JARGON_BUSTER = 'Jargon Buster',
}

export enum WorkbenchTool {
    RESEARCH = 'Research & Citations',
    ORIGINALITY = 'Originality',
    LANGUAGE = 'Language',
    REVIEW = 'Peer Review',
}

export enum CommunityCategory {
    INQUIRY = 'Inquiry',
    DISCOVERY = 'Discovery',
    EXPERIMENT = 'Experiment',
    VALIDATE = 'Validation',
    IMPLEMENT = 'Implementation',
}

export interface Source {
    web: {
        uri: string;
        title: string;
    }
}

export interface GeminiResponse {
    text: string;
    sources?: Source[];
}

export interface JargonDefinition {
    term: string;
    definition: string;
}

export interface Checkpoint {
    id: string;
    content: string;
    timestamp: string;
    charCount: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    handle: string;
    avatarUrl: string;
    role?: 'Career Scientist' | 'Civilian Scientist';
    bio?: string;
    interests?: string[];
}

export interface ProjectMember extends User {
    projectRole: 'Lead' | 'Collaborator' | 'Advisor';
}

export interface Project {
    id: string;
    title: string;
    description: string;
    status: 'Recruiting' | 'In Progress' | 'Completed';
    progress?: number;
    isSeekingFunding: boolean;
    seekingCivilianScientists: boolean;
    tags: string[];
    members: ProjectMember[];
}

export interface Post {
    id: string;
    author: User;
    content: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
    comments: number;
    isBookmarked: boolean;
    category: CommunityCategory;
}

export interface Comment {
    id: string;
    author: User;
    content: string;
    timestamp: string;
}

export interface Event {
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    isOnline: boolean;
    attendees: User[];
}

export interface Notification {
    id: string;
    type: 'like' | 'comment' | 'mention' | 'project_invite';
    content: string;
    timestamp: string;
    isRead: boolean;
    link: string; // e.g., to the post or project
    sender: User;
}

// --- WebSocket Payload Types ---
export interface NewCommentPayload {
    postId: string;
    comment: Comment;
}


// --- Service Payload Types ---

export interface CreateProjectPayload {
    title: string;
    description: string;
    tags: string[];
    seekingCivilianScientists: boolean;
    isSeekingFunding: boolean;
}

export interface CreateEventPayload {
    title: string;
    date: string; // ISO 8601 format
    location: string;
    description: string;
    isOnline: boolean;
}

export interface UpdateUserPayload {
    name?: string;
    bio?: string;
    interests?: string[];
    role?: 'Career Scientist' | 'Civilian Scientist';
}

// --- Dynamic Content Types ---

export interface UserStats {
    posts: number;
    projects: number;
    reviews: number;
    citations: number;
}

export interface DonationTierInfo {
    id: string;
    title: string;
    amount: number;
    recurring: 'per month' | 'one-time';
    description: string;
    isPopular: boolean;
}

export interface Sponsor {
    id: string;
    name: string;
    logoUrl?: string;
}

export interface FundingInfo {
    tiers: DonationTierInfo[];
    sponsors: Sponsor[];
}

export interface KnowledgeBaseArticle {
    id: string;
    title: string;
    description: string;
    icon: string;
    audience: 'Civilian Scientist' | 'Career Scientist' | 'General';
    category: string;
}