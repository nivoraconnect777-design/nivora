import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
import { createError } from '../middleware/errorHandler';

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;

    if (!username) {
      throw createError('Username is required', 400, 'VALIDATION_FAILED');
    }

    const user = await userService.getUserByUsername(username);

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    next(createError(error.message, 404, 'USER_NOT_FOUND'));
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { username, displayName, bio, profilePicUrl } = req.body;

    if (!userId) {
      throw createError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const updatedUser = await userService.updateProfile(userId, {
      username,
      displayName,
      bio,
      profilePicUrl,
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    next(createError(error.message, 400, 'UPDATE_FAILED'));
  }
};

export const checkUsername = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;
    const userId = (req as any).user?.id;

    if (!username) {
      throw createError('Username is required', 400, 'VALIDATION_FAILED');
    }

    const result = await userService.checkUsernameAvailability(username, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    next(createError(error.message, 400, 'CHECK_FAILED'));
  }
};
