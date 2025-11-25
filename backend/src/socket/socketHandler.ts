import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
    user?: {
        id: string;
        username: string;
    };
}

export const initializeSocket = (io: Server) => {
    // Middleware for authentication
    io.use((socket: AuthenticatedSocket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'session-secret') as any;
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log(`User connected: ${socket.user?.username} (${socket.id})`);

        // Join a personal room for notifications/direct messages
        if (socket.user) {
            socket.join(socket.user.id);
        }



        // Handle new message (mostly for optimistic updates or specific events, 
        // actual message saving should be done via API to ensure consistency)
        // However, we can emit the message to the room here if the API call is successful
        // The client will call the API, and the API can emit the event via IO instance if needed
        // Or the client can emit this event after successful API call.
        // For simplicity and security, we'll let the API controller handle the broadcast.

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user?.username}`);
        });
    });
};
