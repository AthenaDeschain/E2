import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authService } from '../services/authService';
import ConfirmActionModal from '../components/modals/ConfirmActionModal';

const SettingsPage: React.FC = () => {
    const { logout } = useAuth();
    const { addToast } = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            addToast('New passwords do not match.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            await authService.changePassword({ currentPassword, newPassword });
            addToast('Password changed successfully!', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            addToast(error.message || 'Failed to change password.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await authService.deleteAccount({ password: deletePassword });
            addToast('Account deleted successfully. You will be logged out.', 'info');
            setTimeout(async () => {
                await logout();
            }, 2000);
        } catch (error: any) {
            addToast(error.message || 'Failed to delete account.', 'error');
            setIsDeleting(false);
            setIsDeleteModalOpen(false); // Close modal on failure
        }
    };

    const inputStyles = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500";
    const buttonStyles = "px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400";

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">Settings</h1>

                    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Change Password</h2>
                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className={inputStyles} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className={inputStyles} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputStyles} />
                            </div>
                            <button type="submit" disabled={isSaving} className={buttonStyles}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Delete Account</h2>
                        <p className="text-red-700 dark:text-red-400 mb-4">This action is permanent and cannot be undone. All your data, including posts, comments, and projects, will be permanently deleted.</p>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                            Delete My Account
                        </button>
                    </div>
                </div>
            </div>
            <ConfirmActionModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Confirm Account Deletion"
                confirmText="Delete Account"
                isDestructive={true}
                isActioning={isDeleting}
            >
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    This is your final confirmation. To proceed, please enter your password.
                </p>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className={inputStyles}
                />
            </ConfirmActionModal>
        </>
    );
};

export default SettingsPage;
