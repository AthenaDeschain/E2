import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginProps {
    onSwitch: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitch }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            // The AuthProvider will handle redirecting
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to log in.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">Welcome Back</h2>
            {error && <p className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 focus:border-indigo-500"
                    />
                </div>
                 <div>
                    <label htmlFor="password"  className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                         className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 focus:border-indigo-500"
                    />
                </div>
                 <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
             <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <button onClick={onSwitch} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Sign Up
                </button>
            </p>
        </div>
    );
};

export default Login;