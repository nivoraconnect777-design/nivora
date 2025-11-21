import { Request, Response, NextFunction } from 'express';
import followService from '../services/followService';
import { createError } from '../middleware/errorHandler';

export const followUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followerId = (req as any).user?.userId;
    const { id: followingId } = req.params;

    if (!followerId) {
      throw createError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    if (!followingId) {
      throw createError('User ID required', 400, 'VALIDATION_FAILED');
    }

    const result = await followService.followUser(followerId, followingId);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Followed successfully',
    });
  } catch (error: any) {
    next(createError(error.message, 400, 'FOLLOW_FAILED'));
  }
};

export const unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followerId = (req as any).user?.userId;
    const { id: followingId } = req.params;

    if (!followerId) {
      throw createError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    if (!followingId) {
      throw createError('User ID required', 400, 'VALIDATION_FAILED');
    }

    const result = await followService.unfollowUser(followerId, followingId);

    res.json({
      success: true,
      data: result,
      message: 'Unfollowed successfully',
    });
  } catch (error: any) {
    next(createError(error.message, 400, 'UNFOLLOW_FAILED'));
  }
};

export const getFollowers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      throw createError('User ID required', 400, 'VALIDATION_FAILED');
    }

    const result = await followService.getFollowers(userId, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    next(createError(error.message, 400, 'FETCH_FAILED'));
  }
};

export const getFollowing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      throw createError('User ID required', 400, 'VALIDATION_FAILED');
    }

    const result = await followService.getFollowing(userId, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    next(createError(error.message, 400, 'FETCH_FAILED'));
  }
};

export const checkFollowStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followerId = (req as any).user?.userId;
    const { id: followingId } = req.params;

    if (!followerId) {
      throw createError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    if (!followingId) {
      throw createError('User ID required', 400, 'VALIDATION_FAILED');
    }

    const isFollowing = await followService.isFollowing(followerId, followingId);

    res.json({
      success: true,
      data: { isFollowing },
    });
  } catch (error: any) {
    next(createError(error.message, 400, 'CHECK_FAILED'));
  }
};
