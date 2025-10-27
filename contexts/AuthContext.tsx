import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    login: (email: string, password_unused: string) => Promise<void>;
    signup: (name: string, email: string, password_unused: string) => Promise<void>;
    logout: () => Promise<void>; // Changed to return Promise
    isLoading: boolean;
    setUser?: React.Dispatch<React.SetStateAction<User | null>>; // For profile updates
    loginAsDev: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // This function now runs for all environments, checking for a valid session token.
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
    }, []);

    const login = async (email: string, password_unused: string) => {
        const loggedInUser = await authService.login(email, password_unused);
        setUser(loggedInUser);
    };

    const signup = async (name: string, email: string, password_unused: string) => {
        const signedUpUser = await authService.signup(name, email, password_unused);
        setUser(signedUpUser);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const loginAsDev = async () => {
        // This function simulates a login for the dev user, which now requires calling the mock API.
        try {
            const devUser = await authService.login('athenaozanich@gmail.com', 'devpassword');
            setUser(devUser);
        } catch(error) {
            console.error("Dev login failed", error);
        }
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