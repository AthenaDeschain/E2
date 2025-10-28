import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext, AuthContextType } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { SocketContext } from './contexts/SocketContext';
import { User } from './types';
// FIX: Import jest for mock functions
import { jest } from '@jest/globals';

// Mock Socket Provider for a stable test environment
const MockSocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const value = {
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
    };
    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

// Custom Auth Provider that allows mocking user state for tests
const createMockAuthProvider = (user: User | null, isLoading: boolean) => {
    // FIX: Return a named FC to help with type inference and fix children prop error
    const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const value: AuthContextType = {
            user,
            isLoading,
            login: jest.fn().mockResolvedValue(undefined),
            signup: jest.fn().mockResolvedValue(undefined),
            logout: jest.fn().mockResolvedValue(undefined),
            setUser: jest.fn(),
        };
        return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };
    return MockAuthProvider;
};

const renderWithProviders = (
  ui: ReactElement,
  {
    initialUser = null,
    isLoading = false,
    ...renderOptions
  }: { initialUser?: User | null, isLoading?: boolean } & Omit<RenderOptions, 'wrapper'> = {},
) => {
    const MockAuthProvider = createMockAuthProvider(initialUser, isLoading);
    const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
      <MockAuthProvider>
        <MockSocketProvider>
          <ToastProvider>{children}</ToastProvider>
        </MockSocketProvider>
      </MockAuthProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything from RTL, but override render
export { screen, fireEvent, waitFor };
export { renderWithProviders as render };