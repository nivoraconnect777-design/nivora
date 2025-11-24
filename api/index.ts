import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

// Import routes
import authRoutes from '../backend/src/routes/authRoutes';
import userRoutes from '../backend/src/routes/userRoutes';
import followRoutes from '../backend/src/routes/followRoutes';
import searchRoutes from '../backend/src/routes/searchRoutes';
import mediaRoutes from '../backend/src/routes/mediaRoutes';
import exploreRoutes from '../backend/src/routes/exploreRoutes';
import reelsRoutes from '../backend/src/routes/reelsRoutes';
import postRoutes from '../backend/src/routes/postRoutes';
import messageRoutes from '../backend/src/routes/messageRoutes';

// Import middleware
import { errorHandler } from '../backend/src/middleware/errorHandler';
import { notFoundHandler } from '../backend/src/middleware/notFoundHandler';

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', followRoutes); // Changed from /api/follow to match frontend
app.use('/api/search', searchRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/reels', reelsRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Export for Vercel
export default app;
