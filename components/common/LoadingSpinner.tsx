import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div role="status" aria-live="polite" className="flex justify-center items-center p-4">
            <div className="flex space-x-2" aria-hidden="true">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default LoadingSpinner;