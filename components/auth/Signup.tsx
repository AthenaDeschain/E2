import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SignupProps {
    onSwitch: () => void;
    onNavigateToLegal: (page: 'terms' | 'privacy') => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitch, onNavigateToLegal }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!termsAccepted) {
            setError('You must agree to the terms to sign up.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await signup(name, email, password);
        } catch (err: any) {
            setError(err.message || 'Failed to sign up.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">Create an Account</h2>
            {error && <p className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                 <div>
                    <label htmlFor="email-signup" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                        id="email-signup"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                 <div>
                    <label htmlFor="password-signup" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <input
                        id="password-signup"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                         className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input id="terms" name="terms" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="text-slate-500 dark:text-slate-400">
                            I agree to the{' '}
                            <button type="button" onClick={() => onNavigateToLegal('terms')} className="font-medium text-blue-600 hover:text-blue-500">Terms of Service</button> and{' '}
                            <button type="button" onClick={() => onNavigateToLegal('privacy')} className="font-medium text-blue-600 hover:text-blue-500">Privacy Policy</button>.
                        </label>
                    </div>
                </div>
                 <button
                    type="submit"
                    disabled={isLoading || !termsAccepted}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
             <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <button onClick={onSwitch} className="font-medium text-blue-600 hover:text-blue-500">
                    Sign In
                </button>
            </p>
        </div>
    );
};

export default Signup;