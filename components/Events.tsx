import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import apiService from '../services/apiService';
import LoadingSpinner from './common/LoadingSpinner';
import CreateEventModal from './modals/CreateEventModal';

const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm flex flex-col sm:flex-row overflow-hidden">
        <div className="flex-shrink-0 sm:w-1/3 md:w-1/4 p-6 flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-center border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700">
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-300">{new Date(event.date).getDate()}</p>
            <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">{new Date(event.date).toLocaleString('default', { month: 'short' })}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(event.date).getFullYear()}</p>
        </div>
        <div className="p-6 flex-grow">
            <span className={`inline-block px-2 py-1 mb-2 text-xs font-semibold rounded-full ${event.isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'}`}>
                {event.isOnline ? 'Online' : 'In-Person'}
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{event.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{event.description}</p>
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                <span>{event.location}</span>
            </div>
        </div>
         <div className="p-6 flex flex-col justify-center items-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
            <button className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                Register
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{event.attendees.length} attending</p>
        </div>
    </div>
);


const Events: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const fetchedEvents = await apiService<Event[]>('/events');
                const sortedEvents = fetchedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setEvents(sortedEvents);
            } catch (err) {
                setError("Failed to load events. The backend might be offline.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleEventCreated = (newEvent: Event) => {
        setEvents(prevEvents => [newEvent, ...prevEvents].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setIsCreateModalOpen(false);
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="py-16"><LoadingSpinner /></div>;
        }
        if (error) {
            return <div className="text-center py-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">{error}</div>;
        }
        if (events.length > 0) {
            return (
                <div className="space-y-6">
                    {events.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            );
        }
        return (
            <div className="text-center py-16 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                <h3 className="text-xl font-medium text-slate-900 dark:text-slate-200">No upcoming events</h3>
                <p className="mt-1 text-slate-500 dark:text-slate-400">Check back later or create a new event for the community.</p>
            </div>
        );
    }

    return (
        <>
            {isCreateModalOpen && (
                <CreateEventModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onEventCreated={handleEventCreated}
                />
            )}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="md:flex md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Community Events</h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">Connect with fellow scientists at workshops, webinars, and meetups.</p>
                        </div>
                         <button onClick={() => setIsCreateModalOpen(true)} className="mt-4 md:mt-0 w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                            Create Event
                        </button>
                    </div>

                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default Events;