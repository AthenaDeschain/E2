import React, { useState } from 'react';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';

const AuthPage: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);

    const toggleView = () => setIsLoginView(!isLoginView);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                     <h1 className="text-5xl font-bold text-slate-900 dark:text-white">Eureka²</h1>
                     <p className="text-slate-500 dark:text-slate-400 mt-2">A Type-1 platform, for a Type-1 future.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    {isLoginView ? <Login onSwitch={toggleView} /> : <Signup onSwitch={toggleView} />}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;