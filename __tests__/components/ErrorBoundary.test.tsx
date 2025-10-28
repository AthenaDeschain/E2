import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';
// FIX: Import Jest globals to resolve TypeScript errors.
import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';

// Mock console.error to prevent logging expected errors during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});


const ProblemChild = () => {
  throw new Error('This is a test error');
};

describe('ErrorBoundary', () => {
  it('should catch an error from a child component and display a fallback UI', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    // Verify that the fallback UI is rendered
    expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText(/We've encountered an unexpected error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refresh Page/i })).toBeInTheDocument();
  });

  it('should render children correctly when there is no error', () => {
    const GoodChild = () => <div>Everything is fine</div>;
    
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );

    // Verify that the child component renders and the fallback UI does not
    expect(screen.getByText('Everything is fine')).toBeInTheDocument();
    expect(screen.queryByText('Oops! Something went wrong.')).not.toBeInTheDocument();
  });
});