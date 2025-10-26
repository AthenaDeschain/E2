import React, { useState, useEffect, Fragment } from 'react';
import { Page, CommunityCategory, User } from './types';
import { NAV_ITEMS, COMMUNITY_CATEGORIES } from './constants';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import KnowledgeBase from './components/KnowledgeBase';
import ToolsPage from './components/ToolsPage';
import Profile from './components/Profile';
import Events from './components/Events';
import Funding from './components/Funding';
import Bookmarks from './components/Bookmarks';
import Tooltip from './components/common/Tooltip';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import LoadingSpinner from './components/common/LoadingSpinner';

type Theme = 'light' | 'dark';

const Sidebar: React.FC<{
    activePage: Page;
    setActivePage: (page: Page) => void;
    isCollapsed: boolean;
    onToggle: () => void;
    currentUser: User;
    onLogout: () => void;
}> = ({ activePage, setActivePage, isCollapsed, onToggle, currentUser, onLogout }) => {
    return (
        <aside className={`bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0 hidden md:flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`p-4 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
                {isCollapsed ? (
                     <span className="text-3xl font-bold text-slate-900 dark:text-white">E²</span>
                ) : (
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Eureka²</h1>
                )}
            </div>
            <nav className="p-2 flex-grow overflow-y-auto overflow-x-hidden">
                {NAV_ITEMS.map((group) => (
                    <div key={group.group} className="mb-4">
                        {!isCollapsed && <h3 className="px-3 py-2 text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">{group.group}</h3>}
                        <ul className="space-y-1">
                            {group.items.map((item) => {
                                const buttonContent = (
                                    <button
                                        onClick={() => setActivePage(item.name)}
                                        className={`w-full flex items-center p-3 rounded-md text-left transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''} ${
                                            activePage === item.name
                                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <span className={isCollapsed ? '' : 'mr-3'}>{item.icon}</span>
                                        {!isCollapsed && <span className="font-medium">{item.name}</span>}
                                    </button>
                                );

                                return (
                                    <li key={item.name}>
                                        {isCollapsed ? (
                                            <Tooltip tip={item.name} position="right">
                                                {buttonContent}
                                            </Tooltip>
                                        ) : (
                                            buttonContent
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
            <div className="flex-shrink-0">
                <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                     <Tooltip tip={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"} position="right">
                        <button onClick={onToggle} className="w-full flex items-center justify-center p-3 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            {isCollapsed ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            )}
                        </button>
                    </Tooltip>
                </div>
                 <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    {isCollapsed ? (
                        <Tooltip tip={`${currentUser.name} (@${currentUser.handle})`} position="right">
                            <button onClick={() => setActivePage(Page.PROFILE)} className="w-full flex justify-center items-center">
                                <img className="h-10 w-10 rounded-full hover:ring-2 hover:ring-blue-500 transition-all" src={currentUser.avatarUrl} alt={currentUser.name}/>
                            </button>
                        </Tooltip>
                    ) : (
                        <div className="flex items-center w-full">
                             <button onClick={() => setActivePage(Page.PROFILE)} className="flex items-center group flex-grow">
                                <img className="h-10 w-10 rounded-full group-hover:ring-2 group-hover:ring-blue-500 transition-all" src={currentUser.avatarUrl} alt={currentUser.name}/>
                                <div className="ml-3 text-left">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{currentUser.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:underline">@{currentUser.handle}</p>
                                </div>
                            </button>
                            <Tooltip tip="Logout" position="top">
                                <button onClick={onLogout} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </Tooltip>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

const MobileSidebar: React.FC<{ activePage: Page, setActivePage: (page: Page) => void, closeMenu: () => void, currentUser: User, onLogout: () => void }> = ({ activePage, setActivePage, closeMenu, currentUser, onLogout }) => {
    const handleNavigation = (page: Page) => {
        setActivePage(page);
        closeMenu();
    };

    return (
        <div className="relative z-40 md:hidden" role="dialog" aria-modal="true">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" onClick={closeMenu}></div>

            <div className="fixed inset-0 flex z-40">
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-800 transform transition ease-in-out duration-300 -translate-x-full"
                    style={{ transform: 'translateX(0)' }}>
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button type="button" onClick={closeMenu} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                            <span className="sr-only">Close sidebar</span>
                            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto overflow-x-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center">
                           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Eureka²</h1>
                        </div>
                        <nav className="mt-5 px-2">
                            {NAV_ITEMS.map((group) => (
                            <div key={group.group} className="mb-4">
                                <h3 className="px-3 py-2 text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">{group.group}</h3>
                                <ul className="space-y-1">
                                    {group.items.map((item) => (
                                        <li key={item.name}>
                                            <button
                                                onClick={() => handleNavigation(item.name)}
                                                className={`w-full flex items-center p-3 rounded-md text-left transition-colors duration-200 ${
                                                    activePage === item.name
                                                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold'
                                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                <span className="mr-3">{item.icon}</span>
                                                <span>{item.name}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        </nav>
                    </div>
                     <div className="flex-shrink-0 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 p-4">
                         <button onClick={() => handleNavigation(Page.PROFILE)} className="flex items-center group">
                            <img className="h-10 w-10 rounded-full group-hover:ring-2 group-hover:ring-blue-500 transition-all" src={currentUser.avatarUrl} alt={currentUser.name}/>
                            <div className="ml-3 text-left">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{currentUser.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:underline">@{currentUser.handle}</p>
                            </div>
                        </button>
                         <Tooltip tip="Logout" position="top">
                            <button onClick={onLogout} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </Tooltip>
                    </div>
                </div>
                <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
            </div>
        </div>
    );
};

const Header: React.FC<{ 
    theme: Theme, 
    toggleTheme: () => void, 
    setActivePage: (page: Page) => void, 
    activePage: Page, 
    onMenuClick: () => void,
    activeCategory: CommunityCategory,
    setActiveCategory: (category: CommunityCategory) => void,
    currentUser: User
}> = ({ theme, toggleTheme, setActivePage, activePage, onMenuClick, activeCategory, setActiveCategory, currentUser }) => {
    
    const TABS = COMMUNITY_CATEGORIES.map(c => ({ name: c.name, value: c.name }));

    return (
        <header className="flex-shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
            <div className="px-4 h-16 flex items-center">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 rounded-md text-slate-500 dark:text-slate-400">
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 ml-2 md:ml-0">{activePage}</h2>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
                            {theme === 'light' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            )}
                        </button>
                        <button className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                        <button onClick={() => setActivePage(Page.PROFILE)} className="md:hidden">
                            <img className="h-9 w-9 rounded-full" src={currentUser.avatarUrl} alt={currentUser.name}/>
                        </button>
                    </div>
                </div>
            </div>
            {activePage === Page.FEED && (
                <div className="px-4">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Communities">
                    {TABS.map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveCategory(tab.value as CommunityCategory)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeCategory === tab.value
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    )
}

const AppContent: React.FC = () => {
    const { user, logout, isLoading } = useAuth();
    const [activePage, setActivePage] = useState<Page>(Page.FEED);
    const [activeCategory, setActiveCategory] = useState<CommunityCategory>(CommunityCategory.INQUIRY);
    const [theme, setTheme] = useState<Theme>(localStorage.getItem('theme') as Theme || 'light');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);


    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(prevState => !prevState);
    };

    const renderActivePage = (currentUser: User) => {
        switch (activePage) {
            case Page.FEED:
                return <Dashboard activeCategory={activeCategory} />;
            case Page.MY_PROJECTS:
                return <Projects />;
            case Page.KNOWLEDGE_BASE:
                return <KnowledgeBase />;
            case Page.TOOLS:
                return <ToolsPage />;
            case Page.PROFILE:
                return <Profile user={currentUser} />;
            case Page.EVENTS:
                return <Events />;
            case Page.FUNDING:
                return <Funding />;
            case Page.BOOKMARKS:
                return <Bookmarks />;
            default:
                return <Dashboard activeCategory={activeCategory} />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <LoadingSpinner />
            </div>
        )
    }

    if (!user) {
        return <AuthPage />;
    }

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {isMobileMenuOpen && <MobileSidebar activePage={activePage} setActivePage={setActivePage} closeMenu={() => setIsMobileMenuOpen(false)} currentUser={user} onLogout={logout} />}
            <Sidebar 
                activePage={activePage} 
                setActivePage={setActivePage} 
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
                currentUser={user}
                onLogout={logout}
            />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
                <Header 
                    theme={theme} 
                    toggleTheme={toggleTheme} 
                    setActivePage={setActivePage} 
                    activePage={activePage} 
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    currentUser={user}
                />
                <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                    {renderActivePage(user)}
                </main>
            </div>
        </div>
    );
};

const App: React.FC = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
)

export default App;
