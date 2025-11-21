import prisma from '../config/database';

class FollowService {
  async followUser(followerId: string, followingId: string) {
    // Prevent self-follow
    if (followerId === followingId) {
      throw new Error('You cannot follow yourself');
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new Error('Already following this user');
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicUrl: true,
          },
        },
      },
    });

    return follow;
  }

  async unfollowUser(followerId: string, followingId: string) {
    // Check if follow relationship exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      throw new Error('Not following this user');
    }

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return { message: 'Unfollowed successfully' };
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicUrl: true,
              bio: true,
            },
          },
        },
      }),
      prisma.follow.count({
        where: { followingId: userId },
      }),
    ]);

    return {
      followers: followers.map((f) => f.follower),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicUrl: true,
              bio: true,
            },
          },
        },
      }),
      prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    return {
      following: following.map((f) => f.following),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return !!follow;
  }

  async getFollowCounts(userId: string) {
    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      followers: followersCount,
      following: followingCount,
    };
  }
}

export default new FollowService();
