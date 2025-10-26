import React, { useState } from 'react';
import { WritingTool } from '../types';
import { WRITING_TOOLS } from '../constants';
import Workbench from './Workbench';
import GuidedWritingProcess from './GuidedWritingProcess';
import JargonBuster from './JargonBuster';

const ToolsPage: React.FC = () => {
    const [activeTool, setActiveTool] = useState<WritingTool>(WritingTool.WORKBENCH);

    const renderActiveTool = () => {
        switch (activeTool) {
            case WritingTool.WORKBENCH:
                return <Workbench />;
            case WritingTool.GUIDED_WRITING:
                return <GuidedWritingProcess />;
            case WritingTool.JARGON_BUSTER:
                return <JargonBuster />;
            default:
                return <Workbench />;
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <header className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                <div className="max-w-7xl mx-auto">
                     <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Writing Tools</h1>
                     <p className="mt-1 text-slate-500 dark:text-slate-400">AI-powered assistance for all scientists' writing needs.</p>
                     <nav className="mt-4">
                        <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg p-1 max-w-md">
                            {WRITING_TOOLS.map(tool => (
                                <button
                                    key={tool.name}
                                    onClick={() => setActiveTool(tool.name)}
                                    className={`w-full text-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        activeTool === tool.name
                                            ? 'bg-blue-600 text-white shadow'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {tool.name}
                                </button>
                            ))}
                        </div>
                     </nav>
                </div>
            </header>
            <div className="flex-grow overflow-y-auto">
                {renderActiveTool()}
            </div>
        </div>
    );
}

export default ToolsPage;