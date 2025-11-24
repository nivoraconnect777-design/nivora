import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { createError } from './errorHandler';

// Extend Express Request type globally
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
      };
      cookies?: any; // Add cookies property
    }
  }
}

// Export AuthRequest as an alias for Request for backward compatibility
export type AuthRequest = Request;

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Try to get token from cookie first (production), then from Authorization header (fallback)
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw createError('No token provided', 401, 'AUTH_TOKEN_MISSING');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    if (!decoded.userId) {
      throw createError('Invalid token payload', 401, 'AUTH_TOKEN_INVALID');
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
        },
      });
    } catch (dbError) {
      console.error('Auth Middleware Database Error:', dbError);
      throw createError('Database connection failed during auth', 500, 'AUTH_DB_ERROR');
    }

    if (!user) {
      throw createError('User not found', 401, 'AUTH_USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error('Auth Middleware Error:', error);
    if (error.name === 'JsonWebTokenError') {
      next(createError('Invalid token', 401, 'AUTH_TOKEN_INVALID'));
    } else if (error.name === 'TokenExpiredError') {
      next(createError('Token expired', 401, 'AUTH_TOKEN_EXPIRED'));
    } else {
      next(error);
    }
  }
};
