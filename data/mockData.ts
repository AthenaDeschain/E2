import { User, Project, Post, Event, CommunityCategory, ProjectMember } from '../types';

export const mockUsers: User[] = [
    {
        id: 'devuser-123',
        name: 'Athena Deschain',
        email: 'athenaozanich@gmail.com',
        handle: 'athena_deschain',
        avatarUrl: 'https://i.pravatar.cc/150?u=athenadeschain',
        role: 'Civilian Scientist',
        bio: 'Passionate civilian scientist exploring the wonders of the universe. Specializing in data visualization and Python scripting. This is a development account.',
        interests: ['Astronomy', 'Data Visualization', 'Python', 'Citizen Science', 'Astrophotography'],
    },
    {
        id: 'user-2',
        name: 'Albert Einstein',
        email: 'albert.einstein@eurekasq.com',
        handle: 'al_einstein',
        avatarUrl: 'https://i.pravatar.cc/150?u=alberteinstein',
        role: 'Career Scientist',
        bio: 'Developed the theory of relativity, one of the two pillars of modern physics. My work is also known for its influence on the philosophy of science.',
        interests: ['Physics', 'Relativity', 'Quantum Mechanics', 'Philosophy of Science'],
    },
    {
        id: 'user-3',
        name: 'Carl Sagan',
        email: 'carl.sagan@eurekasq.com',
        handle: 'carl_sagan',
        avatarUrl: 'https://i.pravatar.cc/150?u=carlsagan',
        role: 'Civilian Scientist',
        bio: 'Astronomer, cosmologist, astrophysicist, astrobiologist, author, and science communicator. My major contribution was to the scientific research of extraterrestrial life.',
        interests: ['Astronomy', 'Cosmology', 'Science Communication', 'SETI'],
    },
     {
        id: 'user-4',
        name: 'Rosalind Franklin',
        email: 'rosalind.franklin@eurekasq.com',
        handle: 'ros_franklin',
        avatarUrl: 'https://i.pravatar.cc/150?u=rosalindfranklin',
        role: 'Career Scientist',
        bio: 'English chemist and X-ray crystallographer whose work was central to the understanding of the molecular structures of DNA, RNA, viruses, coal, and graphite.',
        interests: ['Chemistry', 'DNA', 'X-ray Crystallography', 'Virology'],
    },
];

export const mockProjects: Project[] = [
    {
        id: 'proj-1',
        title: 'Advanced Radiation Measurement Techniques',
        description: 'Developing new methods for accurately measuring and analyzing radioactive isotopes using quantum-tunneling detectors. This project aims to improve safety protocols in nuclear facilities.',
        status: 'In Progress',
        progress: 75,
        isSeekingFunding: false,
        seekingCivilianScientists: false,
        tags: ['Physics', 'Radioactivity', 'Quantum Mechanics'],
        members: [
            { ...(mockUsers.find(u => u.id === 'devuser-123') as User), projectRole: 'Lead' },
            { ...(mockUsers.find(u => u.id === 'user-2') as User), projectRole: 'Advisor' },
        ],
    },
    {
        id: 'proj-2',
        title: 'Mapping the Local Interstellar Medium',
        description: 'A collaborative effort to map the dust and gas clouds in our local galactic neighborhood. We are seeking amateur astronomers to contribute observational data.',
        status: 'Recruiting',
        isSeekingFunding: true,
        seekingCivilianScientists: true,
        tags: ['Astronomy', 'Citizen Science', 'Astrophysics'],
        members: [
            { ...(mockUsers.find(u => u.id === 'user-3') as User), projectRole: 'Lead' },
        ],
    },
    {
        id: 'proj-3',
        title: 'DNA Structure Visualization using AI',
        description: 'Utilizing machine learning models to generate high-fidelity 3D visualizations of DNA structures from X-ray crystallography data. The project is fully funded and has completed its primary objectives.',
        status: 'Completed',
        isSeekingFunding: false,
        seekingCivilianScientists: false,
        tags: ['Biology', 'AI', 'Genetics', 'Data Visualization'],
        members: [
            { ...(mockUsers.find(u => u.id === 'user-4') as User), projectRole: 'Lead' },
            { ...(mockUsers.find(u => u.id === 'devuser-123') as User), projectRole: 'Collaborator' },
        ],
    },
];

export const mockPosts: Post[] = [
    {
        id: 'post-1',
        author: mockUsers[1],
        content: `Just published a new paper on the cosmological constant. The implications for dark energy are fascinating. It's mind-boggling to think about the expansion of the universe. E=mc² was just the beginning!`,
        timestamp: '2h ago',
        likes: 128,
        isLiked: true,
        comments: 15,
        isBookmarked: true,
        category: CommunityCategory.DISCOVERY,
    },
    {
        id: 'post-2',
        author: mockUsers[2],
        content: `What's the most compelling evidence for extraterrestrial life you've come across? I'm compiling resources for a new public lecture series and would love to hear from the community. Let's make this a collaborative effort! #SETI`,
        timestamp: '5h ago',
        likes: 256,
        isLiked: false,
        comments: 42,
        isBookmarked: true,
        category: CommunityCategory.INQUIRY,
    },
    {
        id: 'post-3',
        author: mockUsers[0],
        content: `My latest astrophotography rig captured some stunning images of the Andromeda galaxy. The data suggests a higher-than-expected rate of stellar formation in the outer arms. Has anyone seen similar data from M31?`,
        timestamp: '1d ago',
        likes: 77,
        isLiked: false,
        comments: 9,
        isBookmarked: false,
        category: CommunityCategory.EXPERIMENT,
    },
     {
        id: 'post-4',
        author: mockUsers[3],
        content: `I've shared the complete dataset and methodology for my recent work on TMV virus structure in the Knowledge Base. I invite everyone to review and validate the findings. Open science is the key to faster progress!`,
        timestamp: '2d ago',
        likes: 98,
        isLiked: true,
        comments: 21,
        isBookmarked: false,
        category: CommunityCategory.VALIDATE,
    },
];

export const mockEvents: Event[] = [
    {
        id: 'event-1',
        title: 'Webinar: The Future of Citizen Science',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // One week from now
        location: 'Online',
        description: 'Join Carl Sagan and other leading science communicators to discuss how civilian scientists are shaping the future of research.',
        isOnline: true,
        attendees: [mockUsers[0], mockUsers[1]],
    },
    {
        id: 'event-2',
        title: 'Conference: Advances in Radio-Chemistry',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // One month from now
        location: 'Paris, France',
        description: 'The premier annual conference for chemists and physicists working with radioactive elements. Keynote by Rosalind Franklin.',
        isOnline: false,
        attendees: [mockUsers[0], mockUsers[2], mockUsers[3]],
    },
];