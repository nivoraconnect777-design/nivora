import prisma from '../config/database';

interface UpdateProfileData {
  username?: string;
  displayName?: string;
  bio?: string;
  profilePicUrl?: string;
}

class UserService {
  async getUserByUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        profilePicUrl: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      profilePicUrl: user.profilePicUrl,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      stats: {
        posts: user._count.posts,
        followers: user._count.followers,
        following: user._count.following,
      },
    };
  }

  async updateProfile(userId: string, data: UpdateProfileData) {
    // Validate bio length
    if (data.bio && data.bio.length > 150) {
      throw new Error('Bio must be 150 characters or less');
    }

    // Validate username if provided
    if (data.username) {
      // Check length
      if (data.username.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }

      // Check format
      if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        throw new Error('Username can only contain letters, numbers, and underscores');
      }

      // Check if username is taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new Error('This username is already taken. Try a different one.');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        displayName: data.displayName,
        bio: data.bio,
        profilePicUrl: data.profilePicUrl,
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        profilePicUrl: true,
        isVerified: true,
      },
    });

    return updatedUser;
  }

  async checkUsernameAvailability(username: string, excludeUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { available: true };
    }

    if (excludeUserId && user.id === excludeUserId) {
      return { available: true };
    }

    return { available: false };
  }
}

export default new UserService();
