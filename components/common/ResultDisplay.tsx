import React from 'react';
import { GeminiResponse } from '../../types';

interface ResultDisplayProps {
    result: GeminiResponse | null;
    title?: string;
}

const parseMarkdown = (text: string) => {
    let html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-800 dark:text-slate-200 mt-5 mb-3">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-4">$1</h1>')
        .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic my-4 text-slate-500 dark:text-slate-400">$1</blockquote>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-700 rounded-sm px-1.5 py-1 text-sm font-mono text-emerald-600 dark:text-emerald-400">$1</code>')
        .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')
        .replace(/\n/g, '<br />');

    // Wrap consecutive list items in <ul> or <ol> tags
    html = html.replace(/<br \/>(<(li|ul|ol))/g, '$1');
    html = html.replace(/(<(li).*?<\/li>)(?!<(li))/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul><br \/><ul>/g, '');


    return html;
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, title = "Results" }) => {
    if (!result) return null;

    return (
        <div className="mt-6 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{title}</h2>
                <div 
                    className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(result.text) }}
                ></div>
            </div>
            {result.sources && result.sources.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">Sources</h3>
                    <ul className="space-y-2">
                        {result.sources.map((source, index) => (
                            <li key={index} className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                <a
                                    href={source.web.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline break-words"
                                >
                                    {source.web.title || source.web.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ResultDisplay;