import React, { useState } from 'react';
import { mockEvents } from '../data/mockData';
import { Event } from '../types';

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6 flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 text-center sm:text-left">
                <p className="text-blue-600 dark:text-blue-400 font-bold">{event.date.split(' ')[0].toUpperCase()}</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{event.date.split(' ')[1].replace(',', '')}</p>
                <p className="text-slate-500 dark:text-slate-400">{event.date.split(' ')[2]}</p>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-6">
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2 ${
                    event.type === 'Webinar' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                    event.type === 'Workshop' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                    {event.type}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{event.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{event.time}</p>
                <p className="mt-3 text-slate-600 dark:text-slate-300">{event.description}</p>
                 <div className="flex items-center mt-4">
                    <div className="flex -space-x-2 mr-3">
                        {event.hosts.map(host => (
                             <img
                                key={host.handle}
                                className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800"
                                src={host.avatarUrl}
                                alt={host.name}
                                title={`Hosted by ${host.name}`}
                            />
                        ))}
                    </div>
                     <span className="text-sm text-slate-500 dark:text-slate-400">Hosted by {event.hosts.map(h => h.name).join(', ')}</span>
                </div>
            </div>
            <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-auto flex items-center">
                {event.isPast ? (
                    <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        View Recording
                    </button>
                ) : (
                    <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                        RSVP Now
                    </button>
                )}
            </div>
        </div>
    );
};


const Events: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past'>('Upcoming');

    const upcomingEvents = mockEvents.filter(e => !e.isPast);
    const pastEvents = mockEvents.filter(e => e.isPast);

    const eventsToShow = activeTab === 'Upcoming' ? upcomingEvents : pastEvents;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Community Events</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">Learn, connect, and collaborate with scientists from around the globe.</p>
                    </div>
                     <button className="mt-4 md:mt-0 w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                        Host an Event
                    </button>
                </div>
                
                {/* Tab Navigation */}
                <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        <button onClick={() => setActiveTab('Upcoming')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'Upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Upcoming</button>
                        <button onClick={() => setActiveTab('Past')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'Past' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Past</button>
                    </nav>
                </div>

                <div className="space-y-6">
                     {eventsToShow.length > 0 ? (
                        eventsToShow.map(event => <EventCard key={event.id} event={event} />)
                     ) : (
                        <div className="text-center py-16">
                            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No {activeTab.toLowerCase()} events</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Check back soon for more events.</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default Events;