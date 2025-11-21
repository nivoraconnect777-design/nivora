import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import prisma from '../config/database';
import emailService from './emailService';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

interface LoginData {
  emailOrUsername: string;
  password: string;
}

interface GoogleUserData {
  googleId: string;
  email: string;
  displayName: string;
  profilePicUrl?: string;
}

class AuthService {
  private generateToken(userId: string, expiresIn: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn });
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
  }

  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  async register(data: RegisterData) {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new Error('Email already registered');
      }
      throw new Error('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generate verification token
    const verificationToken = this.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        displayName: data.displayName || data.username,
        verificationToken,
        verificationExpires,
        isVerified: false,
      },
    });

    // Send verification email
    console.log('📧 Sending verification email to:', user.email);
    const emailSent = await emailService.sendVerificationEmail(user.email, verificationToken);
    
    if (!emailSent) {
      console.warn('⚠️ Verification email failed to send, but user was created');
    } else {
      console.log('✅ Verification email sent successfully');
    }

    // Generate tokens
    const accessToken = this.generateToken(user.id, process.env.JWT_EXPIRES_IN || '15m');
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        profilePicUrl: user.profilePicUrl,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginData) {
    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.emailOrUsername }, { username: data.emailOrUsername }],
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user has a password (not a Google OAuth user)
    if (!user.password) {
      throw new Error('This account uses Google Sign-In. Please login with Google.');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check if email is verified (only for non-Google users)
    if (!user.isVerified && !user.googleId) {
      throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
    }

    // Generate tokens
    const accessToken = this.generateToken(user.id, process.env.JWT_EXPIRES_IN || '15m');
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        profilePicUrl: user.profilePicUrl,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async googleAuth(googleData: GoogleUserData) {
    // Check if user exists with this Google ID
    let user = await prisma.user.findFirst({
      where: { googleId: googleData.googleId },
    });

    if (!user) {
      // Check if user exists with this email
      user = await prisma.user.findUnique({
        where: { email: googleData.email },
      });

      if (user) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleData.googleId,
            isVerified: true, // Google accounts are pre-verified
          },
        });
      } else {
        // Create new user
        const username = googleData.email.split('@')[0] + '_' + randomBytes(4).toString('hex');
        user = await prisma.user.create({
          data: {
            googleId: googleData.googleId,
            email: googleData.email,
            username,
            displayName: googleData.displayName,
            profilePicUrl: googleData.profilePicUrl,
            password: '', // No password for Google users
            isVerified: true,
          },
        });
      }
    }

    // Generate tokens
    const accessToken = this.generateToken(user.id, process.env.JWT_EXPIRES_IN || '15m');
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        profilePicUrl: user.profilePicUrl,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    // Generate tokens for automatic login
    const accessToken = this.generateToken(updatedUser.id, process.env.JWT_EXPIRES_IN || '15m');
    const refreshToken = this.generateRefreshToken(updatedUser.id);

    return {
      message: 'Email verified successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        profilePicUrl: updatedUser.profilePicUrl,
        isVerified: updatedUser.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        userId: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const accessToken = this.generateToken(user.id, process.env.JWT_EXPIRES_IN || '15m');

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isVerified) {
      throw new Error('Email already verified');
    }

    // Generate new verification token
    const verificationToken = this.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires,
      },
    });

    await emailService.sendVerificationEmail(user.email, verificationToken);

    return { message: 'Verification email sent' };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = this.generateVerificationToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: resetToken,
        verificationExpires: resetExpires,
      },
    });

    console.log('📧 Sending password reset email to:', user.email);
    const emailSent = await emailService.sendPasswordResetEmail(user.email, resetToken);
    
    if (!emailSent) {
      console.warn('⚠️ Password reset email failed to send');
    } else {
      console.log('✅ Password reset email sent successfully');
    }

    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        profilePicUrl: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

export default new AuthService();
