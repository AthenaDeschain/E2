import React, { useState, useCallback } from 'react';
import { JargonDefinition } from '../types';
import { bustJargon } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';

const JARGON_EXAMPLES = [
    { name: 'Physics', text: 'The experiment investigates quantum entanglement using photonic qubits, which requires cryogenic cooling to reduce decoherence.' },
    { name: 'Biology', text: 'CRISPR-Cas9 is a genome editing tool that uses a guide RNA to create a double-strand break at a specific locus in the DNA.' },
    { name: 'Computer Science', text: 'We fine-tuned a large language model using a supervised learning approach with a dataset of domain-specific text to improve its performance on downstream NLP tasks.' },
    { name: 'Chemistry', text: 'The synthesis involves a nucleophilic substitution reaction, where an electron-rich nucleophile attacks an electrophilic carbon atom, displacing a leaving group.' },
];

const JargonBuster: React.FC = () => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<JargonDefinition[] | null>(null);

    const handleSubmit = useCallback(async () => {
        if (!input.trim()) {
            setError('Input cannot be empty.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResults(null);
        try {
            const response = await bustJargon(input);
            setResults(response);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [input]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Jargon Buster</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Paste any text with complex terminology, and the AI will identify and explain the jargon in simple terms.
                    </p>
                </div>
                
                 <div className="mb-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Try an example:</p>
                    <div className="flex flex-wrap gap-2">
                        {JARGON_EXAMPLES.map(ex => (
                            <button 
                                key={ex.name} 
                                onClick={() => setInput(ex.text)} 
                                className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                {ex.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., 'The experiment investigates quantum entanglement using photonic qubits...'"
                        disabled={isLoading}
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-slate-900 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 min-h-[200px] resize-y"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed dark:focus:ring-offset-slate-900"
                    >
                        {isLoading ? 'Analyzing...' : 'Bust Jargon'}
                    </button>
                </div>

                {error && <div className="mt-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-3 rounded-md">{error}</div>}

                {isLoading && <LoadingSpinner />}

                {results && (
                    <div className="mt-6 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Identified Jargon</h2>
                            {results.length > 0 ? (
                                <ul className="space-y-4">
                                    {results.map((item, index) => (
                                        <li key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-md border-l-4 border-blue-500">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{item.term}</h3>
                                            <p className="text-slate-600 dark:text-slate-300 mt-1">{item.definition}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400">No specific jargon was identified in the text provided.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JargonBuster;