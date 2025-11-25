import { Request, Response, NextFunction } from 'express';
import { StreamChat } from 'stream-chat';
import { createError } from '../middleware/errorHandler';

// Initialize Stream Chat client
// Ensure these env vars are set in .env
const streamClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
);

export const generateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore - req.user is populated by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            throw createError('User not authenticated', 401, 'UNAUTHORIZED');
        }

        // Create a token for the user
        // The token is valid for an indefinite amount of time by default, 
        // but you can set an expiration if needed.
        const token = streamClient.createToken(userId);

        // We can also sync user data to Stream here if we want to ensure it's up to date
        // For example:
        // await streamClient.upsertUser({
        //   id: userId,
        //   name: req.user.username,
        //   image: req.user.profilePicture,
        // });
        // But for now, we'll let the frontend handle user connection/updates or do it on login.

        res.status(200).json({
            success: true,
            token,
            apiKey: process.env.STREAM_API_KEY,
            user: {
                id: userId,
                // @ts-ignore
                name: req.user.username,
                // @ts-ignore
                image: req.user.profilePicture,
            }
        });
    } catch (error: any) {
        next(createError(error.message, 500, 'STREAM_TOKEN_ERROR'));
    }
};
