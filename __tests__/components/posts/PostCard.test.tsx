import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils';
import { PostCard } from '../../../components/posts/PostCard';
import { Post, CommunityCategory, User } from '../../../types';
import { postService } from '../../../services/postService';
// FIX: Import Jest globals to resolve TypeScript errors.
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the postService to isolate the component
jest.mock('../../../services/postService');
const mockedPostService = postService as jest.Mocked<typeof postService>;

// Mock child components to keep tests focused on PostCard's logic
jest.mock('../../../components/posts/CommentSection', () => () => <div>Comment Section</div>);

const mockUser: User = {
  id: 'user-1',
  name: 'Test Author',
  email: 'author@test.com',
  handle: 'testauthor',
  avatarUrl: 'https://i.pravatar.cc/150?u=testauthor',
};

const mockPost: Post = {
  id: 'post-1',
  author: mockUser,
  content: 'This is a test post content.',
  timestamp: '2h ago',
  likes: 10,
  isLiked: false,
  comments: 5,
  isBookmarked: false,
  category: CommunityCategory.DISCOVERY,
};

describe('PostCard Component', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure test isolation
    jest.clearAllMocks();
  });

  it('renders post content, author, and stats correctly', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText(mockPost.author.name)).toBeInTheDocument();
    expect(screen.getByText(`@${mockPost.author.handle} · ${mockPost.timestamp}`)).toBeInTheDocument();
    expect(screen.getByText(mockPost.content)).toBeInTheDocument();
    expect(screen.getByText(`${mockPost.likes} Likes`)).toBeInTheDocument();
    expect(screen.getByText(`${mockPost.comments} Comments`)).toBeInTheDocument();
  });

  it('handles like button click, updates UI optimistically, and calls API', async () => {
    mockedPostService.toggleLike.mockResolvedValue({ likes: 11, isLiked: true });
    
    render(<PostCard post={mockPost} />);

    const likeButton = screen.getByRole('button', { name: /Like post/i });
    
    // Check initial state
    expect(screen.getByText('10 Likes')).toBeInTheDocument();
    
    // Click the like button
    fireEvent.click(likeButton);

    // Check for optimistic UI update
    expect(screen.getByText('11 Likes')).toBeInTheDocument();

    // Verify that the API call was made
    await waitFor(() => {
      expect(mockedPostService.toggleLike).toHaveBeenCalledWith(mockPost.id);
    });
  });

  it('toggles the comment section visibility when the comment button is clicked', () => {
    render(<PostCard post={mockPost} />);

    const commentButton = screen.getByText(/Comments/i);
    
    // Initially, the comment section should be hidden
    expect(screen.queryByText('Comment Section')).not.toBeInTheDocument();

    // Click to show the comment section
    fireEvent.click(commentButton);
    expect(screen.getByText('Comment Section')).toBeInTheDocument();

    // Click again to hide it
    fireEvent.click(commentButton);
    expect(screen.queryByText('Comment Section')).not.toBeInTheDocument();
  });

  it('handles bookmark button click and updates UI optimistically', async () => {
    mockedPostService.toggleBookmark.mockResolvedValue({ isBookmarked: true });
    
    render(<PostCard post={mockPost} />);
    
    const bookmarkButton = screen.getByRole('button', { name: /Bookmark post/i });
    expect(screen.getByText('Bookmark')).toBeInTheDocument();

    // Click the bookmark button
    fireEvent.click(bookmarkButton);

    // Check for optimistic UI update
    expect(screen.getByText('Bookmarked')).toBeInTheDocument();

    // Verify the API call
    await waitFor(() => {
        expect(mockedPostService.toggleBookmark).toHaveBeenCalledWith(mockPost.id);
    });
  });
});