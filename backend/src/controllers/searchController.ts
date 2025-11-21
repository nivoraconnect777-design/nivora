import { Request, Response, NextFunction } from 'express';
import searchService from '../services/searchService';
import { createError } from '../middleware/errorHandler';

export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q: query } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query || typeof query !== 'string') {
      throw createError('Search query required', 400, 'VALIDATION_FAILED');
    }

    const result = await searchService.searchUsers(query, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    next(createError(error.message, 400, 'SEARCH_FAILED'));
  }
};
