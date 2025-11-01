import React, { useState, useCallback } from 'react';
import LoadingSpinner from './common/LoadingSpinner';
import ResultDisplay from './common/ResultDisplay';
import { GeminiResponse } from '../types';

interface ToolInterfaceProps {
    title: string | React.ReactNode;
    description: string;
    placeholder: string;
    buttonText: string;
    isLargeInput?: boolean;
    apiCall: (input: string) => Promise<GeminiResponse>;
    onSuccess?: (response: GeminiResponse) => void;
}

const ToolInterface: React.FC<ToolInterfaceProps> = ({ title, description, placeholder, buttonText, isLargeInput = false, apiCall, onSuccess }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GeminiResponse | null>(null);

    const handleSubmit = useCallback(async () => {
        if (!input.trim()) {
            setError('Input cannot be empty.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await apiCall(input);
            setResult(response);
            if(onSuccess) {
                onSuccess(response);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [input, apiCall, onSuccess]);

    const InputComponent = isLargeInput ? 'textarea' : 'input';

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    {typeof title === 'string' ? (
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
                    ) : (
                       <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{title}</div>
                    )}
                    <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>
                </div>

                <div className="space-y-4">
                    <InputComponent
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={placeholder}
                        disabled={isLoading}
                        className={`w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-slate-900 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 ${isLargeInput ? 'min-h-[200px] resize-y' : ''}`}
                    />
                     <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed dark:focus:ring-offset-slate-900"
                    >
                        {isLoading ? 'Processing...' : buttonText}
                    </button>
                </div>
                
                {error && <div className="mt-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-3 rounded-md">{error}</div>}
                
                {isLoading && <LoadingSpinner />}
                
                {result && <ResultDisplay result={result} title="AI Response"/>}
            </div>
        </div>
    );
}

export default ToolInterface;