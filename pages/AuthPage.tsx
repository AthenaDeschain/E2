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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
            <div className="w-full max-w-[min(90vw,30rem)]">
                <div className="text-center mb-8">
                     <h1 className="text-5xl font-bold text-slate-900 dark:text-white">Eureka²</h1>
                     <p className="text-slate-500 dark:text-slate-400 mt-2">A Type-1 platform, for a Type-1 future.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    {view === 'login' ? (
                        <Login onSwitch={toggleView} /> 
                    ) : (
                        <Signup onSwitch={toggleView} onNavigateToLegal={setView} />
                    )}
                </div>
                 <div className="text-center mt-4 text-xs text-slate-500 dark:text-slate-400">
                    By using Eureka², you agree to our{' '}
                    <button onClick={() => setView('terms')} className="underline hover:text-blue-500">Terms of Service</button> and{' '}
                    <button onClick={() => setView('privacy')} className="underline hover:text-blue-500">Privacy Policy</button>.
                </div>
            </div>
        </div>
    );
};

export default AuthPage;