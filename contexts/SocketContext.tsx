import React, { createContext, useContext, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Post, NewCommentPayload, Notification } from '../types';

// Define the shape of incoming WebSocket messages
interface WebSocketMessage {
    type: 'new_post' | 'new_comment' | 'new_notification';
    payload: any;
}

// Define the structure for our listeners
type ListenerCallback = (payload: any) => void;
interface Listeners {
    [key: string]: ListenerCallback[];
}

interface SocketContextType {
    subscribe: (type: string, callback: ListenerCallback) => void;
    unsubscribe: (type: string, callback: ListenerCallback) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const socketRef = useRef<WebSocket | null>(null);
    const listenersRef = useRef<Listeners>({});

    const subscribe = useCallback((type: string, callback: ListenerCallback) => {
        if (!listenersRef.current[type]) {
            listenersRef.current[type] = [];
        }
        listenersRef.current[type].push(callback);
    }, []);

    const unsubscribe = useCallback((type: string, callback: ListenerCallback) => {
        if (listenersRef.current[type]) {
            listenersRef.current[type] = listenersRef.current[type].filter(
                (cb) => cb !== callback
            );
        }
    }, []);


    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('eureka_jwt');
            if (!token) return;

            // Determine protocol (ws or wss) and construct the URL.
            // This assumes the WebSocket server is running on the same host as the web server.
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const socketUrl = `${protocol}//${window.location.host}/ws?token=${token}`;
            
            const socket = new WebSocket(socketUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log('WebSocket connection established');
            };

            socket.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    const { type, payload } = message;
                    
                    if (listenersRef.current[type]) {
                        listenersRef.current[type].forEach(callback => {
                            callback(payload);
                        });
                    }
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            socket.onclose = () => {
                console.log('WebSocket connection closed');
            };

            // Cleanup on component unmount or user logout
            return () => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.close();
                }
                socketRef.current = null;
            };
        } else {
             if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        }
    }, [user]);

    const value = { subscribe, unsubscribe };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
