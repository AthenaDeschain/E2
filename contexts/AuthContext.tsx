import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
    user: User | null;
    login: (email: string, password_unused: string) => Promise<void>;
    signup: (name: string, email: string, password_unused: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    setUser?: React.Dispatch<React.SetStateAction<User | null>>; // For profile updates
    loginAsDev: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use the primary mock user from the central mock data file
const mockUser = mockUsers[0];


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Define the production hostname. Authentication will only be enforced on this domain.
    // All other hostnames (localhost, preview URLs, etc.) will use the mock developer user.
    // This value should be updated to match the actual production domain upon deployment.
    const PRODUCTION_HOSTNAME = 'eurekasquared.app'; // This is a fictional hostname.

    const isProduction = window.location.hostname === PRODUCTION_HOSTNAME;

    useEffect(() => {
        // If the environment is NOT production, automatically sign in with the mock user.
        if (!isProduction) {
            setUser(mockUser);
            setIsLoading(false);
            return;
        }
        
        // If the environment IS production, perform real authentication.
        const verify = async () => {
            try {
                const verifiedUser = await authService.verifySession();
                setUser(verifiedUser);
            } catch (error) {
                console.error("Session verification failed", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        verify();
    }, [isProduction]);

    const login = async (email: string, password_unused: string) => {
        const loggedInUser = await authService.login(email, password_unused);
        setUser(loggedInUser);
    };

    const signup = async (name: string, email: string, password_unused: string) => {
        const signedUpUser = await authService.signup(name, email, password_unused);
        setUser(signedUpUser);
    };

    const logout = () => {
        // In production, logout clears the token.
        // In dev, it just clears the user from state until next reload.
        if (isProduction) {
            authService.logout();
        }
        setUser(null);
    };

    const loginAsDev = () => {
        setUser(mockUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, isLoading, setUser, loginAsDev }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};