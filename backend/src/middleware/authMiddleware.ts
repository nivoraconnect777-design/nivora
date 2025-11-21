import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get token from httpOnly cookie first (PRODUCTION STANDARD)
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header for backward compatibility
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw createError('No token provided', 401, 'UNAUTHORIZED');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      (req as any).user = decoded;
      next();
    } catch (error) {
      throw createError('Invalid or expired token', 401, 'UNAUTHORIZED');
    }
  } catch (error) {
    next(error);
  }
};
