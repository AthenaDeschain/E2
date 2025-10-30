import React, { useState } from 'react';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import LegalPage from './LegalPage';

type AuthView = 'login' | 'signup' | 'terms' | 'privacy';

const AuthPage: React.FC = () => {
    const [view, setView] = useState<AuthView>('login');

    if (view === 'terms') {
        return <LegalPage type="terms" onBack={() => setView('signup')} />;
    }
    if (view === 'privacy') {
        return <LegalPage type="privacy" onBack={() => setView('signup')} />;
    }

    const toggleView = () => setView(view === 'login' ? 'signup' : 'login');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-gray-900 bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-gray-900 px-4 py-8 sm:py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                     <h1 className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-500">Eureka²</h1>
                     <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">A Type-1 platform, for a Type-1 future.</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
                    {view === 'login' ? (
                        <Login onSwitch={toggleView} /> 
                    ) : (
                        <Signup onSwitch={toggleView} onNavigateToLegal={setView} />
                    )}
                </div>
                 <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
                    By using Eureka², you agree to our{' '}
                    <button onClick={() => setView('terms')} className="font-medium underline text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition">Terms of Service</button> and{' '}
                    <button onClick={() => setView('privacy')} className="font-medium underline text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition">Privacy Policy</button>.
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
