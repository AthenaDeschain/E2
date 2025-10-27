import React, { useState, useEffect, useCallback } from 'react';
import { WorkbenchTool, Checkpoint, GeminiResponse } from '../types';
import { SUB_TOOLS } from '../constants';
import { getResearchAndCitations, validateOriginality, updateLanguage, performRigorousReview } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
import ResultDisplay from './common/ResultDisplay';
import Tooltip from './common/Tooltip';

type Audience = 'Academic' | 'Public';

const Workbench: React.FC = () => {
    const [paperContent, setPaperContent] = useState<string>('');
    const [activeSubTool, setActiveSubTool] = useState<WorkbenchTool>(WorkbenchTool.LANGUAGE);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GeminiResponse | null>(null);
    const [researchInput, setResearchInput] = useState<string>('');
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
    const [audience, setAudience] = useState<Audience>('Public');
    const [showCheckpoints, setShowCheckpoints] = useState<boolean>(false);


    useEffect(() => {
        try {
            const savedContent = localStorage.getItem('workbench_content') || '';
            setPaperContent(savedContent);
            const savedCheckpoints = JSON.parse(localStorage.getItem('workbench_checkpoints') || '[]');
            setCheckpoints(savedCheckpoints);
        } catch (e) {
            console.error("Failed to load from local storage", e);
        }
    }, []);
    
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPaperContent(e.target.value);
        localStorage.setItem('workbench_content', e.target.value);
    };

    const handleSaveCheckpoint = () => {
        if (!paperContent.trim()) return;
        const newCheckpoint: Checkpoint = {
            id: `cp-${Date.now()}`,
            content: paperContent,
            timestamp: Date.now(),
            charCount: paperContent.length,
        };
        const updatedCheckpoints = [newCheckpoint, ...checkpoints];
        setCheckpoints(updatedCheckpoints);
        localStorage.setItem('workbench_checkpoints', JSON.stringify(updatedCheckpoints));
    };

    const handleLoadCheckpoint = (content: string) => {
        setPaperContent(content);
        localStorage.setItem('workbench_content', content);
    };

    const handleDeleteCheckpoint = (id: string) => {
        const updatedCheckpoints = checkpoints.filter(cp => cp.id !== id);
        setCheckpoints(updatedCheckpoints);
        localStorage.setItem('workbench_checkpoints', JSON.stringify(updatedCheckpoints));
    };

    const handleRunTool = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        
        let apiCall: Promise<GeminiResponse>;
        let input: string;

        switch(activeSubTool) {
            case WorkbenchTool.RESEARCH:
                if (!researchInput.trim()) {
                    setError('Research topic cannot be empty.');
                    setIsLoading(false);
                    return;
                }
                input = researchInput;
                apiCall = getResearchAndCitations(input);
                break;
            case WorkbenchTool.ORIGINALITY:
                input = paperContent;
                apiCall = validateOriginality(input);
                break;
            case WorkbenchTool.LANGUAGE:
                input = paperContent;
                apiCall = updateLanguage(input, audience);
                break;
            case WorkbenchTool.REVIEW:
                input = paperContent;
                apiCall = performRigorousReview(input, audience);
                break;
            default:
                setError('Invalid tool selected.');
                setIsLoading(false);
                return;
        }

        if (!input.trim() && activeSubTool !== WorkbenchTool.RESEARCH) {
            setError('Paper content cannot be empty.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await apiCall;
            setResult(response);
            if (activeSubTool === WorkbenchTool.LANGUAGE) {
                if(window.confirm("Do you want to replace the editor content with the updated language?")) {
                    setPaperContent(response.text);
                    localStorage.setItem('workbench_content', response.text);
                }
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }

    }, [activeSubTool, paperContent, researchInput, audience]);
    
    const showAudienceToggle = activeSubTool === WorkbenchTool.LANGUAGE || activeSubTool === WorkbenchTool.REVIEW;

    return (
        <div className="flex flex-col lg:flex-row h-full bg-slate-50 dark:bg-slate-900">
            {/* Left Panel: Editor & Checkpoints */}
            <div className="w-full lg:w-1/2 p-4 flex flex-col border-r border-slate-200 dark:border-slate-700">
                 <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Editor</h2>
                <textarea
                    value={paperContent}
                    onChange={handleContentChange}
                    placeholder="Start writing your paper, report, or blog post here..."
                    className="w-full flex-grow p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-slate-900 dark:text-slate-200 resize-none"
                />
                 <div className="flex-shrink-0 mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Checkpoints</h3>
                         <button onClick={() => setShowCheckpoints(!showCheckpoints)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                            {showCheckpoints ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            )}
                        </button>
                    </div>
                     {showCheckpoints && (
                         <>
                            <button onClick={handleSaveCheckpoint} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900">
                                Save Current Draft
                            </button>
                            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2">
                                {checkpoints.map(cp => (
                                    <div key={cp.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                                        <div>
                                            <p className="font-medium text-sm text-slate-700 dark:text-slate-300">Saved on {new Date(cp.timestamp).toLocaleString()}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{cp.charCount} characters</p>
                                        </div>
                                        <div className="space-x-2">
                                            <button onClick={() => handleLoadCheckpoint(cp.content)} className="text-xs text-blue-600 hover:underline">Load</button>
                                            <button onClick={() => handleDeleteCheckpoint(cp.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                                        </div>
                                    </div>
                                ))}
                                 {checkpoints.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No checkpoints saved yet.</p>}
                            </div>
                         </>
                     )}
                 </div>
            </div>

            {/* Right Panel: AI Tools */}
            <div className="w-full lg:w-1/2 p-4 flex flex-col">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">AI Tools</h2>
                <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                    <div className="flex space-x-1">
                        {SUB_TOOLS.map(tool => (
                             <Tooltip key={tool.name} tip={tool.description} position="bottom">
                                <button onClick={() => setActiveSubTool(tool.name as WorkbenchTool)} className={`flex-1 flex items-center justify-center p-2 rounded-md text-sm font-medium transition-colors ${activeSubTool === tool.name ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}>
                                    {tool.icon}
                                    <span className="ml-2 hidden sm:inline">{tool.name}</span>
                                </button>
                             </Tooltip>
                        ))}
                    </div>
                </div>
                
                <div className="py-4 flex-shrink-0">
                     {activeSubTool === WorkbenchTool.RESEARCH && (
                         <input 
                             type="text"
                             value={researchInput}
                             onChange={(e) => setResearchInput(e.target.value)}
                             placeholder="Enter research topic..."
                             className="w-full p-2 mb-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md"
                         />
                     )}
                     {showAudienceToggle && (
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
                            <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                                <button onClick={() => setAudience('Public')} className={`w-full py-1.5 text-sm rounded-md transition-all ${audience === 'Public' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>Public</button>
                                <button onClick={() => setAudience('Academic')} className={`w-full py-1.5 text-sm rounded-md transition-all ${audience === 'Academic' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>Academic</button>
                            </div>
                        </div>
                     )}
                     <button onClick={handleRunTool} disabled={isLoading} className="w-full px-4 py-2 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-400 transition-colors">
                         {isLoading ? 'Processing...' : `Run ${activeSubTool}`}
                     </button>
                </div>
                
                 <div className="flex-grow overflow-y-auto bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {error && <div className="m-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-3 rounded-md">{error}</div>}
                    {isLoading && <LoadingSpinner />}
                    {result && <ResultDisplay result={result} title={`${activeSubTool} Results`} />}
                    {!isLoading && !result && <div className="flex items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 p-8">Select a tool and run it to see results here.</div>}
                 </div>
            </div>
        </div>
    )
}

export default Workbench;