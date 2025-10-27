import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    login: (email: string, password_unused: string) => Promise<void>;
    signup: (name: string, email: string, password_unused: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    setUser?: React.Dispatch<React.SetStateAction<User | null>>; // For profile updates
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, isLoading, setUser }}>
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
