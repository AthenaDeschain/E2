import React, { useState, useEffect, useRef } from 'react';
import { Event, CreateEventPayload } from '../../types';
import { eventService } from '../../services/eventService';
import { useToast } from '../../contexts/ToastContext';

interface CreateEventModalProps {
    onClose: () => void;
    onEventCreated: (event: Event) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onEventCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [isOnline, setIsOnline] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();
    
    const modalRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const lastFocusedElement = document.activeElement as HTMLElement;
        const modalNode = modalRef.current;
        if (!modalNode) return;

        titleInputRef.current?.focus();

        const focusableElements = modalNode.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
            if (event.key === 'Tab') {
                if (event.shiftKey) { // Shift+Tab
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        event.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        event.preventDefault();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            lastFocusedElement?.focus();
        };
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!title.trim() || !description.trim() || !date.trim() || !location.trim()) {
            setError('All fields are required.');
            return;
        }

        setIsLoading(true);
        const payload: CreateEventPayload = {
            title,
            description,
            date: new Date(date).toISOString(),
            location,
            isOnline,
        };

        try {
            const newEvent = await eventService.createEvent(payload);
            addToast('Event created successfully!', 'success');
            onEventCreated(newEvent);
        } catch (err) {
            const errorMessage = (err instanceof Error) ? err.message : 'Failed to create event.';
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="create-event-title">
            <div ref={modalRef} className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 id="create-event-title" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Create a New Event</h2>
                {error && <p className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md mb-4 text-sm">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="event-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Event Title</label>
                        <input ref={titleInputRef} id="event-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
                    </div>
                     <div>
                        <label htmlFor="event-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date & Time</label>
                        <input id="event-date" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="event-location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Location (or "Online")</label>
                        <input id="event-location" type="text" value={location} onChange={e => setLocation(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
                    </div>
                     <div>
                        <label htmlFor="event-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                        <textarea id="event-desc" value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md resize-y" />
                    </div>
                     <div className="flex items-center">
                        <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={isOnline} onChange={e => setIsOnline(e.target.checked)} className="h-4 w-4 rounded" /><span>This is an online event</span></label>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-400">{isLoading ? 'Creating...' : 'Create Event'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventModal;