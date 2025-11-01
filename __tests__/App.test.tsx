import React from 'react';
import { render, screen, fireEvent } from '../test-utils';
import App from '../App';
import { User } from '../types';
import { describe, it, expect, vi } from 'vitest';

// Mock child components to keep tests focused on App's logic and routing
vi.mock('../pages/AuthPage', () => ({ default: () => <div>Auth Page</div> }));
vi.mock('../components/GlobalFeed', () => ({ default: () => <div>Global Feed</div> }));
vi.mock('../components/Projects', () => ({ default: () => <div>My Projects Page</div> }));

const mockUser: User = {
  id: 'devuser-123',
  name: 'Athena Deschain',
  email: 'athenaozanich@gmail.com',
  handle: 'athena_deschain',
  avatarUrl: 'https://i.pravatar.cc/150?u=athenadeschain',
  role: 'Civilian Scientist'
};

describe('App Component', () => {
  it('shows the loading spinner while auth is loading', () => {
    const { container } = render(<App />, { isLoading: true });
    // This is not ideal as it relies on a class name, but the component has no accessible role or text.
    // A better approach in a real project would be to add role="status" to the spinner div.
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
  
  it('renders AuthPage when user is not authenticated', () => {
    render(<App />, { initialUser: null });
    expect(screen.getByText('Auth Page')).toBeInTheDocument();
  });

  it('renders the main dashboard when user is authenticated', () => {
    render(<App />, { initialUser: mockUser });
    // Check for key elements of the authenticated view, like the header and default page
    expect(screen.getByText(mockUser.name)).toBeInTheDocument(); // In Header
    expect(screen.getByText('Global Feed')).toBeInTheDocument(); // Default page
  });

  it('navigates to different pages when sidebar items are clicked', () => {
    render(<App />, { initialUser: mockUser });

    // Starts on the feed
    expect(screen.getByText('Global Feed')).toBeInTheDocument();

    // Find and click the "My Projects" button in the sidebar
    const projectsButton = screen.getByRole('button', { name: /My Projects/i });
    fireEvent.click(projectsButton);

    // Check that the Projects component is now rendered
    expect(screen.getByText('My Projects Page')).toBeInTheDocument();
    
    // Check that the old page is gone
    expect(screen.queryByText('Global Feed')).not.toBeInTheDocument();
  });
});
