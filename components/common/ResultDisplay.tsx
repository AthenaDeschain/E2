import React from 'react';
import { GeminiResponse } from '../../types';

interface ResultDisplayProps {
    result: GeminiResponse | null;
    title?: string;
    children?: React.ReactNode;
}

const escapeHtml = (unsafe: string): string => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

const parseMarkdown = (text: string): string => {
    if (!text) return '';

    const processLine = (line: string): string => {
        let processedLine = escapeHtml(line);
        processedLine = processedLine
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
        return processedLine;
    };

    const lines = text.split('\n');
    let html = '';
    let inList: 'ul' | 'ol' | null = null;

    for (const line of lines) {
        if (line.trim() === '') {
            if (inList) {
                html += `</${inList}>`;
                inList = null;
            }
            continue;
        }

        if (line.startsWith('# ')) {
            if (inList) { html += `</${inList}>`; inList = null; }
            html += `<h1>${processLine(line.substring(2))}</h1>`;
            continue;
        }
        if (line.startsWith('## ')) {
            if (inList) { html += `</${inList}>`; inList = null; }
            html += `<h2>${processLine(line.substring(3))}</h2>`;
            continue;
        }
        if (line.startsWith('### ')) {
            if (inList) { html += `</${inList}>`; inList = null; }
            html += `<h3>${processLine(line.substring(4))}</h3>`;
            continue;
        }
        if (line.startsWith('> ')) {
            if (inList) { html += `</${inList}>`; inList = null; }
            html += `<blockquote><p>${processLine(line.substring(2))}</p></blockquote>`;
            continue;
        }

        const isUnordered = line.startsWith('- ') || line.startsWith('* ');
        const isOrdered = /^\d+\. /.test(line);

        if (isUnordered) {
            if (inList !== 'ul') {
                if (inList) { html += `</${inList}>`; }
                html += '<ul>';
                inList = 'ul';
            }
            html += `<li>${processLine(line.substring(2))}</li>`;
        } else if (isOrdered) {
            if (inList !== 'ol') {
                if (inList) { html += `</${inList}>`; }
                html += '<ol>';
                inList = 'ol';
            }
            html += `<li>${processLine(line.replace(/^\d+\. /, ''))}</li>`;
        } else {
            if (inList) {
                html += `</${inList}>`;
                inList = null;
            }
            html += `<p>${processLine(line)}</p>`;
        }
    }

    if (inList) {
        html += `</${inList}>`;
    }

    return html;
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, title = "Results", children }) => {
    if (!result) return null;

    return (
        <div className="mt-6 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{title}</h2>
                <div 
                    className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(result.text) }}
                ></div>
                 {children && <div className="mt-4">{children}</div>}
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