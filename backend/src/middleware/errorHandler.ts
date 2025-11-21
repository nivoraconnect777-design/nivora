import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  field?: string;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  // Log error for debugging
  console.error('Error:', {
    code,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.message,
      details: err.details,
      field: err.field,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

// Helper function to create API errors
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any,
  field?: string
): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  error.field = field;
  return error;
};
