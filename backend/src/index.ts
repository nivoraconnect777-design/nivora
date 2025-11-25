import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import prisma from './config/database';
import authRoutes from './routes/authRoutes';
import testRoutes from './routes/testRoutes';
import userRoutes from './routes/userRoutes';
import mediaRoutes from './routes/mediaRoutes';
import followRoutes from './routes/followRoutes';
import searchRoutes from './routes/searchRoutes';
import postRoutes from './routes/postRoutes';
import healthRoutes from './routes/healthRoutes';
import streamRoutes from './routes/streamRoutes';
import notificationRoutes from './routes/notificationRoutes';
import reelsRoutes from './routes/reelsRoutes';
import storyRoutes from './routes/storyRoutes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeSocket } from './socket/socketHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware (required for Passport)
app.use(
  session({
    secret: process.env.JWT_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Make io accessible in routes
app.set('io', io);

// Initialize socket handler
initializeSocket(io);

// API routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Social Media API',
    version: '1.0.0',
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Media routes
app.use('/api/media', mediaRoutes);

// Follow routes
app.use('/api/users', followRoutes);

// Search routes
app.use('/api/search', searchRoutes);

// Post routes
app.use('/api/posts', postRoutes);

// Stream routes
app.use('/api/stream', streamRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Reels routes
app.use('/api/reels', reelsRoutes);

// Story routes
app.use('/api/stories', storyRoutes);

// Health check routes
app.use('/api', healthRoutes);

// Test routes (REMOVE IN PRODUCTION)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/test', testRoutes);
  console.log('🧪 Test routes enabled at /api/test');
}

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
httpServer.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);

  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});
