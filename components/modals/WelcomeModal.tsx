import React, { useState } from 'react';
import { User } from '../../types';
import { userService } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

interface WelcomeModalProps {
    onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
    const { user, setUser } = useAuth();
    const { addToast } = useToast();
    const [role, setRole] = useState<'Career Scientist' | 'Civilian Scientist'>('Civilian Scientist');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!user || !setUser) return;
        setIsLoading(true);
        try {
            const updatedUser = await userService.updateProfile({ role });
            setUser(updatedUser);
            addToast('Welcome to Eureka²!', 'success');
            onClose();
        } catch (error: any) {
            addToast(error.message || 'Failed to save profile.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <h2 id="welcome-title" className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Eureka²!</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Let's complete your profile. This helps us tailor your experience.</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">How do you identify?</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as any)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                        >
                            <option>Civilian Scientist</option>
                            <option>Career Scientist</option>
                        </select>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This can be changed later in your profile.</p>
                    </div>
                </div>
                <div className="flex justify-end pt-6">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
                    >
                        {isLoading ? 'Saving...' : 'Get Started'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
