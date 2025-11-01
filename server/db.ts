import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('FATAL ERROR: MONGODB_URI is not defined in the environment variables.');
        }
        await mongoose.connect(mongoUri);
        console.log('Successfully connected to MongoDB.');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        // Fix: Use a type assertion for `process.exit` if Node.js globals are not correctly typed.
        (process as any).exit(1);
    }
};
