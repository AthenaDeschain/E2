import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils';
import Login from '../../../components/auth/Login';
import { authService } from '../../../services/authService';
import { User } from '../../../types';
import { describe, it, expect, vi } from 'vitest';

// Mock the authService to control its behavior in tests
vi.mock('../../../services/authService');
const mockedAuthService = vi.mocked(authService);

describe('Login Component', () => {
  it('renders the login form correctly', () => {
    render(<Login onSwitch={() => {}} />);
    
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('allows user to type in email and password fields', () => {
    render(<Login onSwitch={() => {}} />);
    
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls the login service with correct credentials on form submission', async () => {
    // Mock the login function to resolve successfully
    const mockUser: User = { id: '1', name: 'Test User', email: 'test@example.com', handle: 'testuser', avatarUrl: '' };
    mockedAuthService.login.mockResolvedValue(mockUser);

    render(<Login onSwitch={() => {}} />);
    
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockedAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays an error message on a failed login attempt', async () => {
    // Mock the login function to reject with an error
    mockedAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

    render(<Login onSwitch={() => {}} />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Wait for the error message to appear in the document
    const errorMessage = await screen.findByText('Invalid credentials');
    expect(errorMessage).toBeInTheDocument();
  });
});
