import React from 'react';
import ChangePasswordForm from '../components/settings/ChangePasswordForm';
import DeleteAccountForm from '../components/settings/DeleteAccountForm';

const SettingsPage: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">Settings</h1>
                
                <div className="space-y-8">
                    <ChangePasswordForm />
                    <DeleteAccountForm />
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;