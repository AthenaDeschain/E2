import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';

const ChangePasswordForm: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) { // Example validation
            setError("New password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);
        try {
            await authService.changePassword({ currentPassword, newPassword });
            addToast('Password changed successfully!', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            const errorMessage = (err instanceof Error) ? err.message : 'Failed to change password.';
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white p-6 border-b border-slate-200 dark:border-slate-700">Change Password</h2>
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                    {error && <p className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">{error}</p>}
                    <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                        <input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                        <input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                        <input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 flex justify-end rounded-b-lg">
                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordForm;