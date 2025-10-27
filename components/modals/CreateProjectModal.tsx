import React, { useState } from 'react';
import { projectService, CreateProjectPayload } from '../../services/projectService';
import { Project } from '../../types';

interface CreateProjectModalProps {
    onClose: () => void;
    onProjectCreated: (project: Project) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onProjectCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [seekingCivilianScientists, setSeekingCivilianScientists] = useState(false);
    const [isSeekingFunding, setIsSeekingFunding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!title.trim() || !description.trim()) {
            setError('Title and description are required.');
            return;
        }

        setIsLoading(true);
        const payload: CreateProjectPayload = {
            title,
            description,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            seekingCivilianScientists,
            isSeekingFunding
        };

        try {
            const newProject = await projectService.createProject(payload);
            onProjectCreated(newProject);
        } catch (err: any) {
            setError(err.message || 'Failed to create project.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Start a New Project</h2>
                {error && <p className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md mb-4 text-sm">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Project Title</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md resize-y" />
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tags (comma-separated)</label>
                        <input id="tags" type="text" value={tags} onChange={e => setTags(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={seekingCivilianScientists} onChange={e => setSeekingCivilianScientists(e.target.checked)} className="h-4 w-4 rounded" /><span>Recruiting Civilian Scientists</span></label>
                        <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={isSeekingFunding} onChange={e => setIsSeekingFunding(e.target.checked)} className="h-4 w-4 rounded" /><span>Seeking Funding</span></label>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-400">{isLoading ? 'Creating...' : 'Create Project'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;