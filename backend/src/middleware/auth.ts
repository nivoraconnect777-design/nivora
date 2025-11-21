import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw createError('No token provided', 401, 'AUTH_TOKEN_MISSING');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!user) {
      throw createError('User not found', 401, 'AUTH_USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(createError('Invalid token', 401, 'AUTH_TOKEN_INVALID'));
    } else if (error.name === 'TokenExpiredError') {
      next(createError('Token expired', 401, 'AUTH_TOKEN_EXPIRED'));
    } else {
      next(error);
    }
  }
};
