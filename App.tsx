import React, { useState, useEffect } from 'react';
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
import Header from './components/layout/Header';
import SettingsPage from './pages/SettingsPage';
import WelcomeModal from './components/modals/WelcomeModal';
import PostDetailView from './components/posts/PostDetailView';


const App: React.FC = () => {
    const { user, isLoading } = useAuth();
    const [currentPage, setCurrentPage] = useState<Page>(Page.FEED);
    const [selectedCommunity, setSelectedCommunity] = useState<CommunityCategory | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [viewingPostId, setViewingPostId] = useState<string | null>(null);

    useEffect(() => {
        if (user && !user.role) {
            setShowWelcomeModal(true);
        }
    }, [user]);

    const handlePageChange = (page: Page) => {
        setSelectedCommunity(null); // Reset sub-navigation when changing main page
        setViewingPostId(null); // Reset post view when changing page
        setCurrentPage(page);
    };

    const navigateToPost = (link: string) => {
        const postId = link.split('/').pop();
        if (postId) {
            setViewingPostId(postId);
            // Optionally, switch to the feed page if not already there,
            // depending on desired UX when clicking a notification for a post.
            // setCurrentPage(Page.FEED); 
        }
    };

    const renderPage = () => {
        if (viewingPostId) {
            return <PostDetailView postId={viewingPostId} onBack={() => setViewingPostId(null)} />;
        }
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
            case Page.SETTINGS:
                return <SettingsPage />;
            default:
                return <GlobalFeed />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
                <div className="w-16 h-16 border-4 border-amber-500 border-dashed rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <AuthPage />;
    }
    
    return (
        <div className="flex h-screen bg-slate-100 dark:bg-indigo-950 text-slate-800 dark:text-slate-200">
            {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}
            {/* Sidebar */}
            <aside className={`bg-white dark:bg-purple-900/20 border-r border-slate-200 dark:border-indigo-800 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-indigo-800 h-16">
                    <span className={`font-bold text-2xl text-slate-900 dark:text-white ${!isSidebarOpen && 'hidden'}`}>E²</span>
                     <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-indigo-700"
                        aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                        aria-expanded={isSidebarOpen}
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>

                <nav className="flex-grow p-2 space-y-2">
                    {NAV_ITEMS.map(group => (
                        <div key={group.group}>
                            <h3 className={`px-2 py-1 text-xs font-semibold text-slate-500 dark:text-indigo-400 uppercase tracking-wider ${!isSidebarOpen && 'text-center'}`}>{isSidebarOpen ? group.group : group.group.substring(0,1)}</h3>
                            {group.items.map(item => (
                                <Tooltip key={item.name} tip={item.name} position="right" disabled={isSidebarOpen}>
                                    <button onClick={() => handlePageChange(item.name)} className={`w-full flex items-center p-3 rounded-md transition-colors ${!isSidebarOpen ? 'justify-center' : ''} ${currentPage === item.name ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300' : 'hover:bg-slate-100 dark:hover:bg-indigo-800'}`}>
                                        {item.icon}
                                        <span className={`ml-4 font-medium ${!isSidebarOpen && 'hidden'}`}>{item.name}</span>
                                    </button>
                                </Tooltip>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header setCurrentPage={setCurrentPage} navigateToPost={navigateToPost} />
                <main className="flex-1 overflow-y-auto">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;