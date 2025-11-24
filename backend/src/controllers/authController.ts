import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { createError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, displayName } = req.body;

    // Validation
    if (!username || !email || !password) {
      throw createError('Missing required fields', 400, 'VALIDATION_FAILED');
    }

    // Password validation
    if (password.length < 8) {
      throw createError('Password must be at least 8 characters', 400, 'VALIDATION_FAILED');
    }

    const result = await authService.register({
      username,
      email,
      password,
      displayName,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error: any) {
    next(createError(error.message, 400, 'REGISTRATION_FAILED'));
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      throw createError('Missing required fields', 400, 'VALIDATION_FAILED');
    }

    const result = await authService.login({ emailOrUsername, password });

    // Set httpOnly cookies for tokens (PRODUCTION STANDARD)
    // Set httpOnly cookies for tokens (PRODUCTION STANDARD)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user data without tokens (tokens are in cookies)
    res.json({
      success: true,
      data: {
        user: result.user,
      },
    });
  } catch (error: any) {
    next(createError(error.message, 401, 'LOGIN_FAILED'));
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      throw createError('Invalid verification token', 400, 'VALIDATION_FAILED');
    }

    const result = await authService.verifyEmail(token);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    next(createError(error.message, 400, 'VERIFICATION_FAILED'));
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw createError('Refresh token required', 401, 'VALIDATION_FAILED');
    }

    const result = await authService.refreshToken(refreshToken);

    // Set new access token in httpOnly cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
    });
  } catch (error: any) {
    next(createError(error.message, 401, 'TOKEN_REFRESH_FAILED'));
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError('Email required', 400, 'VALIDATION_FAILED');
    }

    const result = await authService.resendVerificationEmail(email);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    next(createError(error.message, 400, 'RESEND_FAILED'));
  }
};

export const logout = async (req: Request, res: Response) => {
  // Clear httpOnly cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError('Email required', 400, 'VALIDATION_FAILED');
    }

    const result = await authService.forgotPassword(email);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    next(createError(error.message, 400, 'FORGOT_PASSWORD_FAILED'));
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw createError('Token and password required', 400, 'VALIDATION_FAILED');
    }

    if (password.length < 8) {
      throw createError('Password must be at least 8 characters', 400, 'VALIDATION_FAILED');
    }

    const result = await authService.resetPassword(token, password);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    next(createError(error.message, 400, 'RESET_PASSWORD_FAILED'));
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      throw createError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const user = await authService.getUserById(userId);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    next(createError(error.message, 401, 'GET_USER_FAILED'));
  }
};
