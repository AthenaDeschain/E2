import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    login: (email: string, password_unused: string) => Promise<void>;
    signup: (name: string, email: string, password_unused: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsLoading(false);
    }, []);

    const login = async (email: string, password_unused: string) => {
        const loggedInUser = await authService.login(email, password_unused);
        setUser(loggedInUser);
    };

    const signup = async (name: string, email: string, password_unused: string) => {
        const newUser = await authService.signup(name, email, password_unused);
        setUser(newUser);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };
    
    const value = { user, login, signup, logout, isLoading };

    return (
        <AuthContext.Provider value={value}>
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
