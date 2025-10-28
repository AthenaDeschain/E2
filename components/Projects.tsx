import React, { useState, useMemo, useEffect } from 'react';
import { Project } from '../types';
import Tooltip from './common/Tooltip';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import LoadingSpinner from './common/LoadingSpinner';
import CreateProjectModal from './modals/CreateProjectModal';

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
);

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
        <div className="p-6 flex-grow">
            <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    project.status === 'Recruiting' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                    {project.status}
                </span>
                <div className="flex items-center gap-2">
                    {project.isSeekingFunding && (
                        <Tooltip tip="This project is actively seeking financial support.">
                             <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 cursor-help">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.168-.217c-1.25 0-2.25.939-2.25 2.125s1 2.125 2.25 2.125c.184 0 .358-.024.52-.068v1.698c-.155.103-.346.196-.567.267C6.883 15.89 6 14.88 6 13.625c0-1.523 1.13-2.75 2.5-2.75.056 0 .111.002.167.006a3.502 3.502 0 00-.234-3.463zM12 10a2.5 2.5 0 00-2.5-2.5h-1v5h1A2.5 2.5 0 0012 10z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v1.077a4.5 4.5 0 00-1.823.655l-.496-1.073a1 1 0 10-1.858.862l.5 1.074A4.498 4.498 0 005 10c0 .345.04.68.118 1.003l-.5 1.073a1 1 0 101.858.862l.496-1.073A4.5 4.5 0 008.5 13.5V15a1 1 0 102 0v-1.5a4.5 4.5 0 000-7V5z" clipRule="evenodd" /></svg>
                                Seeking Funding
                            </span>
                        </Tooltip>
                    )}
                    {project.seekingCivilianScientists && (
                         <Tooltip tip="This project is looking for civilian scientists to contribute.">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300 cursor-help">
                               <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                               Recruiting Civilians
                           </span>
                        </Tooltip>
                    )}
                </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{project.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm flex-grow">{project.description}</p>
            {project.status === 'In Progress' && project.progress !== undefined && (
                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{project.progress}%</span>
                    </div>
                    <ProgressBar progress={project.progress} />
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                    <span key={tag} className="text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/80 flex justify-between items-center">
            <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Members</h4>
                <div className="flex -space-x-2">
                    {project.members.map(member => (
                        <img
                            key={member.handle}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800"
                            src={member.avatarUrl}
                            alt={member.name}
                            title={`${member.name} (${member.projectRole})`}
                        />
                    ))}
                </div>
            </div>
             <button disabled={!project.isSeekingFunding} className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">
                {project.isSeekingFunding ? 'Request Funding' : 'Funded'}
            </button>
        </div>
    </div>
);

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [tagFilter, setTagFilter] = useState('All');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchProjects = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            };
            try {
                setIsLoading(true);
                setError(null);
                const fetchedProjects = await apiService<Project[]>('/projects/mine'); 
                setProjects(fetchedProjects);
            } catch (err) {
                setError("Failed to load your projects. The backend might be offline.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, [user]);

    const handleProjectCreated = (newProject: Project) => {
        setProjects(prevProjects => [newProject, ...prevProjects]);
        setIsCreateModalOpen(false);
    };

    const allTags = useMemo(() => ['All', ...Array.from(new Set(projects.flatMap(p => p.tags)))], [projects]);
    
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || project.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
            const matchesTag = tagFilter === 'All' || project.tags.includes(tagFilter);
            return matchesSearch && matchesStatus && matchesTag;
        });
    }, [projects, searchTerm, statusFilter, tagFilter]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="py-16"><LoadingSpinner /></div>;
        }
        if (error) {
            return <div className="text-center py-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">{error}</div>;
        }
        if (filteredProjects.length > 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            );
        }
        return (
            <div className="text-center py-16 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-xl font-medium text-slate-900 dark:text-slate-200">No projects found</h3>
                <p className="mt-1 text-slate-500 dark:text-slate-400">You are not a member of any projects, or your search filters are too restrictive.</p>
            </div>
        );
    }

    return (
        <>
            {isCreateModalOpen && (
                <CreateProjectModal 
                    onClose={() => setIsCreateModalOpen(false)}
                    onProjectCreated={handleProjectCreated}
                />
            )}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="md:flex md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">My Projects</h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">Manage your collaborative research and track your contributions.</p>
                        </div>
                        <button onClick={() => setIsCreateModalOpen(true)} className="mt-4 md:mt-0 w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-900 transition-colors">
                            Start a New Project
                        </button>
                    </div>
                    
                    <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Search your projects..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                            />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                            >
                                <option>All</option>
                                <option>Recruiting</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                            </select>
                             <select
                                value={tagFilter}
                                onChange={e => setTagFilter(e.target.value)}
                                className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                            >
                                {allTags.map(tag => <option key={tag}>{tag}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {renderContent()}

                </div>
            </div>
        </>
    );
};

export default Projects;