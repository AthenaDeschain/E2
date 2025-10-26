export enum Page {
    PROFILE = 'My Profile',
    FEED = 'Communities',
    MY_PROJECTS = 'My Projects',
    BOOKMARKS = 'My Bookmarks',
    TOOLS = 'Writing Tools',
    KNOWLEDGE_BASE = 'Knowledge Base',
    EVENTS = 'Events',
    FUNDING = 'Funding',
}

export enum CommunityCategory {
    INQUIRY = 'Inquiry',
    DISCOVERY = 'Discovery',
    EXPERIMENT = 'Experiment',
    VALIDATE = 'Validate',
    IMPLEMENT = 'Implement',
}


export enum WritingTool {
    WORKBENCH = 'Writing Workbench',
    GUIDED_WRITING = 'Guided Writing Process',
    JARGON_BUSTER = 'Jargon Buster',
}

// Sub-tools for workbench
export enum WorkbenchTool {
    RESEARCH = 'Research & Citations',
    ORIGINALITY = 'Validate Originality',
    LANGUAGE = 'Update Language',
    REVIEW = 'Rigorous Review',
}

export interface User {
    name: string;
    avatarUrl: string;
    handle: string;
    title: string;
    role: 'Career Scientist' | 'Civilian Scientist';
    email: string;
    password?: string;
    bio?: string;
    skills?: string[];
    affiliation?: string;
    links?: {
        website?: string;
        orcid?: string;
    };
    stats?: {
        projects: number;
        posts: number;
        contributions: number;
    }
    superAdmin?: boolean;
}

export interface Post {
    id: string;
    author: User;
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    category: CommunityCategory;
}

export interface Project {
    id:string;
    title: string;
    description: string;
    members: User[];
    status: 'In Progress' | 'Completed' | 'Recruiting';
    tags: string[];
    seekingCivilianScientists?: boolean;
    isSeekingFunding?: boolean;
    progress?: number; // Optional progress percentage for 'In Progress' projects
}

export interface Event {
    id: string;
    title: string;
    type: 'Webinar' | 'Workshop' | 'Q&A' | 'Conference';
    date: string;
    time: string;
    description: string;
    hosts: User[];
    isPast: boolean;
}


export interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    };
}

export interface GeminiResponse {
    text: string;
    sources?: GroundingChunk[];
}

export interface JargonDefinition {
    term: string;
    definition: string;
}

export interface Checkpoint {
    id: string;
    content: string;
    timestamp: number;
    charCount: number;
}