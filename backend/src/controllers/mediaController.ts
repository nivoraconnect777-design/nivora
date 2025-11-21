import { Request, Response, NextFunction } from 'express';
import mediaService from '../services/mediaService';
import { createError } from '../middleware/errorHandler';

export const getUploadSignature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { folder } = req.body;

    const signatureData = await mediaService.generateUploadSignature(folder);

    res.json({
      success: true,
      data: signatureData,
    });
  } catch (error: any) {
    next(createError(error.message, 500, 'SIGNATURE_GENERATION_FAILED'));
  }
};
