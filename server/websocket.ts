import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { URL } from 'url';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Store clients in a simple Set
const clients = new Set<WebSocket>();

export function initWebsocket(server: Server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        try {
            // Authenticate user from token in query param
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const token = url.searchParams.get('token');
            if (!token) {
                ws.close(1008, 'Token required');
                return;
            }
            jwt.verify(token, JWT_SECRET);
            clients.add(ws);
            console.log('WebSocket client connected and authenticated.');
        } catch (error) {
            console.error('WebSocket authentication failed:', error);
            ws.close(1008, 'Invalid token');
            return;
        }

        ws.on('close', () => {
            clients.delete(ws);
            console.log('WebSocket client disconnected.');
        });
        
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            clients.delete(ws);
        });
    });

    console.log('WebSocket server initialized.');
}

export function broadcast(type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
