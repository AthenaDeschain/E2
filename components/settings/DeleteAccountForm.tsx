import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmActionModal from '../modals/ConfirmActionModal';

const DeleteAccountForm: React.FC = () => {
    const [password, setPassword] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();
    const { logout } = useAuth();

    const handleDelete = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.deleteAccount({ password });
            addToast('Account deleted successfully.', 'info');
            // This will trigger a redirect to the auth page in App.tsx
            await logout(); 
        } catch (err) {
            const errorMessage = (err instanceof Error) ? err.message : 'Failed to delete account. Please check your password.';
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
            setIsConfirmModalOpen(false);
            setPassword('');
        }
    };
    
    const openConfirmation = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if(!password.trim()) {
            setError("Password is required to delete your account.");
            return;
        }
        setIsConfirmModalOpen(true);
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-800/50 border border-red-500 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400 p-6 border-b border-red-300 dark:border-red-500/50">Delete Account</h2>
                <form onSubmit={openConfirmation}>
                    <div className="p-6">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            This action is permanent and cannot be undone. All your data, including posts, projects, and comments, will be permanently deleted.
                        </p>
                         {error && <p className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md mb-4 text-sm">{error}</p>}
                        <div>
                            <label htmlFor="confirm-delete-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Enter your password to confirm</label>
                            <input id="confirm-delete-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 flex justify-end rounded-b-lg">
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-400">
                            Delete My Account
                        </button>
                    </div>
                </form>
            </div>

            <ConfirmActionModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="Are you absolutely sure?"
                confirmText="Yes, delete my account"
                isDestructive={true}
                isActioning={isLoading}
            >
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    This is your final confirmation. Deleting your account is irreversible.
                </p>
            </ConfirmActionModal>
        </>
    );
};

export default DeleteAccountForm;