import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserModel } from './models/User';
import { User } from '../src/types';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file.");
    // Fix: Use a type assertion for `process.exit` if Node.js globals are not correctly typed.
    (process as any).exit(1);
}

// Extend Express's Request type to include the user property
declare global {
    namespace Express {
        export interface Request {
            user?: User;
        }
    }
}

export const createToken = (user: { id: string, email: string }): string => {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
};


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const user = await UserModel.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid token. User not found.' });
        }
        
        req.user = user.toJSON() as User;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};