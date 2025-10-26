import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse, GroundingChunk, JargonDefinition } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

type Audience = 'Academic' | 'Public';

const generateContent = async (prompt: string, useSearch: boolean): Promise<GeminiResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: useSearch ? { tools: [{ googleSearch: {} }] } : {},
        });

        const text = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        const sources: GroundingChunk[] = groundingChunks ? groundingChunks.map((chunk: any) => ({
            web: {
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || 'Untitled',
            }
        })).filter((source: GroundingChunk) => source.web.uri) : [];

        return { text, sources };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get response from AI. Please check your API key and network connection.");
    }
};

// --- Writing Workbench Functions ---

export const getResearchAndCitations = (topic: string) => {
    const prompt = `Find recent and highly-cited academic papers on the topic of "${topic}". 
    For each paper, provide:
    1. A concise summary of its key findings and contributions.
    2. A properly formatted APA 7th edition citation.
    
    Present the results in a clear, well-structured format using Markdown. Use headings for each paper.`;
    return generateContent(prompt, true);
};

export const validateOriginality = (text: string) => {
    const prompt = `Act as an expert academic reviewer. Analyze the following research abstract or paper draft for originality and novelty. 
    Compare it against existing published literature available on the web.
    Provide your analysis in a structured report with the following Markdown sections:
    
    ### Originality & Novelty Score (out of 10)
    *Provide a score and a brief justification.*
    
    ### Key Contributions
    *List the primary novel claims or findings.*
    
    ### Potential Overlaps with Existing Work
    *Identify specific concepts, methods, or results that may overlap with previously published research. Cite the sources if possible.*
    
    ### Suggestions for Strengthening Novelty
    *Offer concrete advice on how to emphasize or enhance the unique aspects of this research.*
    
    ---
    
    **Text for Analysis:**
    "${text}"`;
    return generateContent(prompt, true);
};

export const updateLanguage = (text: string, audience: Audience) => {
    const audienceInstruction = audience === 'Academic'
        ? "Revise the following text to meet the standards of a formal scientific publication. Focus on improving clarity, precision, and academic tone. Correct any grammatical errors, awkward phrasing, or informal language."
        : "Rewrite the following text to be clear, engaging, and easily understandable for a general audience (e.g., a curious high school student or a museum exhibit). Avoid jargon, use analogies, and focus on the 'so what?' of the research.";

    const prompt = `You are an expert science communicator. Your task is to adapt the language of a text for a specific audience.
    
    **Target Audience: ${audience}**
    
    **Instruction:** ${audienceInstruction}
    
    Return only the revised text, without any commentary before or after.
    
    ---
    
    **Original Text:**
    "${text}"`;
    return generateContent(prompt, false);
};

export const performRigorousReview = (text: string, audience: Audience) => {
    const audienceInstruction = audience === 'Academic'
        ? `Act as a senior peer reviewer for a prestigious scientific journal. Conduct a rigorous review of the following paper draft. 
           Your goal is to provide constructive, critical feedback to help the author prepare for a real peer review.
           Compare the paper's methodology, findings, and conclusions against the current state of knowledge found on the web.
           Structure your review using standard academic review format (Summary, Major Strengths, Major Weaknesses, Minor Suggestions).`
        : `Act as an informed and curious member of the public reviewing a piece of science communication. 
           Your goal is to provide feedback on how clear, engaging, and impactful the text is.
           Structure your review with these sections: 
           ### What I Learned
           *Summarize the key takeaway points.*
           ### What Was Confusing
           *Point out any jargon or concepts that were hard to understand.*
           ### What Made Me Curious
           *Mention parts that were particularly exciting or made you want to know more.*
           ### Suggestions for Broader Appeal
           *Offer ideas on how to make the text even more engaging for a non-expert audience.*`;

    const prompt = `${audienceInstruction}
    
    ---
    
    **Text for Review:**
    "${text}"`;
    return generateContent(prompt, true);
};

// --- Guided Writing Process Functions ---

export const refineIdea = (idea: string) => {
    const prompt = `Act as a research mentor. A student has proposed the following research idea. Your task is to help them refine it.
    - Analyze the idea for clarity, feasibility, and potential impact.
    - Suggest 2-3 key research questions that could form the core of a paper.
    - Propose a potential title for the project.
    - Provide constructive feedback in a supportive tone.
    
    Format your response using Markdown.
    
    **Initial Idea:** "${idea}"`;
    return generateContent(prompt, true);
};

export const createOutline = (idea: string) => {
    const prompt = `Based on the following refined research idea, generate a standard academic paper outline.
    The outline should include the main sections (Introduction, Literature Review, Methodology, Results, Discussion, Conclusion) and 3-5 bullet points under each section detailing the key content to be included.
    
    **Refined Research Idea:** "${idea}"`;
    return generateContent(prompt, false);
};

export const suggestJournals = (abstract: string) => {
    const prompt = `Act as an experienced academic publisher. Based on the following abstract, suggest 3-5 suitable academic journals for submission. Also suggest 1-2 public-facing platforms (like a specific blog or magazine) where this research could be shared.
    For each venue, provide:
    1.  **Venue Name:**
    2.  **Scope & Aims:** (A brief summary of what the venue publishes)
    3.  **Justification:** (Why this paper is a good fit for the venue)
    4.  **Audience:** (e.g., Academic Peers, General Public)
    
    Use Google Search to find up-to-date information on the venues.
    
    **Abstract:** "${abstract}"`;
    return generateContent(prompt, true);
};

// --- Social & Accessibility Functions ---
export const draftPostWithAI = (topic: string) => {
    const prompt = `You are an AI assistant for a social network of career and civilian scientists. 
    A user wants to create a short, engaging post about their research topic: "${topic}".
    
    Draft a post (under 280 characters) that is:
    1.  **Accessible:** Easy for a broad audience to understand, bridging the gap between experts and enthusiasts.
    2.  **Engaging:** Asks a question or sparks curiosity to encourage discussion.
    3.  **Informative:** Briefly touches on the core idea or a recent finding.
    
    Include 1-3 relevant hashtags that appeal to both communities (e.g., #CitizenScience, #SciComm).
    
    Return only the drafted post text.`;
    return generateContent(prompt, false);
};

export const simplifyText = (text: string) => {
    const prompt = `Explain the following text in simple, easy-to-understand terms, as if you were explaining it to a curious high school student. 
    Avoid jargon where possible, or explain it briefly if it's essential.
    
    Original Text: "${text}"`;
    return generateContent(prompt, false);
};

export const rewritePostForAudience = (text: string, audience: Audience) => {
    const audienceInstruction = audience === 'Academic'
        ? "Rewrite the following social media post to sound more formal and academic, suitable for an audience of career scientists. Focus on precise terminology and a professional tone, while keeping it concise for a social media feed. Return only the rewritten post."
        : "Rewrite the following scientific post to be clear, engaging, and easily understandable for a general audience (civilian scientists, enthusiasts). Avoid jargon, use analogies, and focus on the exciting aspects of the research. Keep it concise for a social media feed. Return only the rewritten post.";

    const prompt = `${audienceInstruction}
    
    ---
    
    **Original Post:**
    "${text}"`;
    return generateContent(prompt, false);
};


export const bustJargon = async (text: string): Promise<JargonDefinition[]> => {
    const prompt = `Identify all technical or scientific jargon in the following text. 
    For each term, provide a concise and simple definition that someone without a scientific background can understand.
    
    Text to analyze: "${text}"`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            term: {
                                type: Type.STRING,
                                description: "The identified jargon or technical term.",
                            },
                            definition: {
                                type: Type.STRING,
                                description: "A simple, easy-to-understand definition of the term.",
                            },
                        },
                        required: ["term", "definition"],
                    },
                },
            },
        });

        const jsonString = response.text;
        const parsedJson = JSON.parse(jsonString);
        return parsedJson as JargonDefinition[];

    } catch (error) {
        console.error("Error calling Gemini API for Jargon Buster:", error);
        throw new Error("Failed to get response from AI. The model may have returned an invalid JSON format.");
    }
};