import 'dotenv/config'; // Load environment variables
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb } from './db.js';
import apiRouter from './api.js'; // Corrected import path
import { initWebsocket } from './websocket.js';
import { ZodError } from 'zod';
import { AppError } from './errors.js';

// Fix: Define __dirname for ES modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

async function main() {
    // Initialize Database
    await initDb();

    // --- Middleware ---
    app.use(cors());
    app.use(express.json());

    // --- API Routes ---
    app.use('/api', apiRouter);

    // --- Serve Static Frontend ---
    const clientBuildPath = path.join(__dirname, '../../dist');
    app.use(express.static(clientBuildPath));

    // The "catchall" handler for Single Page Application routing
    app.get('*', (req, res, next) => {
        // Exclude API and WebSocket routes from the catchall
        if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/ws')) {
            return next();
        }
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
    
    // --- Global Error Handler ---
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error(err); // Keep logging for debugging purposes

        if (err instanceof AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }

        if (err instanceof ZodError) {
            return res.status(400).json({ message: 'Validation failed for one or more fields.', errors: err.errors });
        }
        
        if (err.message?.includes('UNIQUE constraint failed')) {
             return res.status(409).json({ message: 'A record with the provided information already exists. Please use a unique value.' });
        }
        
        // Generic fallback for all other errors
        return res.status(500).json({ message: 'An unexpected internal server error occurred. Please try again later.' });
    });


    // --- Server Initialization ---
    const server = createServer(app);

    // Initialize WebSocket Server
    initWebsocket(server);

    server.listen(port, () => {
        console.log(`🚀 Server is live and running at http://localhost:${port}`);
    });
}

main().catch(err => {
    console.error("Failed to start server:", err);
    // Fix: Use a type assertion for `process.exit` if Node.js globals are not correctly typed.
    (process as any).exit(1);
});