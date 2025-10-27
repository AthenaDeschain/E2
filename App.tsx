import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import { Page, CommunityCategory } from './types';
import { NAV_ITEMS } from './constants';

import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Projects from './components/Projects';
import Bookmarks from './components/Bookmarks';
import ToolsPage from './components/ToolsPage';
import KnowledgeBase from './components/KnowledgeBase';
import Events from './components/Events';
import Funding from './components/Funding';
import Tooltip from './components/common/Tooltip';
import CommunityFeed from './components/CommunityFeed';
import GlobalFeed from './components/GlobalFeed';

const App: React.FC = () => {
    const { user, logout, isLoading } = useAuth();
    const [currentPage, setCurrentPage] = useState<Page>(Page.FEED);
    const [selectedCommunity, setSelectedCommunity] = useState<CommunityCategory | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handlePageChange = (page: Page) => {
        setSelectedCommunity(null); // Reset sub-navigation when changing main page
        setCurrentPage(page);
    };

    const renderPage = () => {
        switch (currentPage) {
            case Page.FEED:
                return <GlobalFeed />;
            case Page.COMMUNITIES:
                 if (selectedCommunity) {
                    return <CommunityFeed category={selectedCommunity} onBack={() => setSelectedCommunity(null)} />;
                }
                return <Dashboard onSelectCommunity={setSelectedCommunity} />;
            case Page.PROFILE:
                return <Profile />;
            case Page.MY_PROJECTS:
                return <Projects />;
            case Page.BOOKMARKS:
                return <Bookmarks />;
            case Page.TOOLS:
                return <ToolsPage />;
            case Page.KNOWLEDGE_BASE:
                return <KnowledgeBase />;
            case Page.EVENTS:
                return <Events />;
            case Page.FUNDING:
                return <Funding />;
            default:
                return <GlobalFeed />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
                <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <AuthPage />;
    }
    
    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {/* Sidebar */}
            <aside className={`bg-white dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <span className={`font-bold text-2xl text-slate-900 dark:text-white ${!isSidebarOpen && 'hidden'}`}>Eureka²</span>
                     <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>

                <nav className="flex-grow p-2 space-y-2">
                    {NAV_ITEMS.map(group => (
                        <div key={group.group}>
                            <h3 className={`px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${!isSidebarOpen && 'text-center'}`}>{isSidebarOpen ? group.group : group.group.substring(0,1)}</h3>
                            {group.items.map(item => (
                                <Tooltip key={item.name} tip={item.name} position="right" >
                                    <button onClick={() => handlePageChange(item.name)} className={`w-full flex items-center p-3 rounded-md transition-colors ${currentPage === item.name ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                        {item.icon}
                                        <span className={`ml-4 font-medium ${!isSidebarOpen && 'hidden'}`}>{item.name}</span>
                                    </button>
                                </Tooltip>
                            ))}
                        </div>
                    ))}
                </nav>

                 <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                        <div className={`ml-3 ${!isSidebarOpen && 'hidden'}`}>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                            <button onClick={logout} className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400">Log out</button>
                        </div>
                    </div>
                </div>

            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;