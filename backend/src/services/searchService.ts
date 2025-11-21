import prisma from '../config/database';

class SearchService {
  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    if (!query || query.trim().length === 0) {
      return {
        users: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const skip = (page - 1) * limit;
    const searchTerm = query.trim().toLowerCase();

    // Search by username, display name, or email (case-insensitive)
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            {
              username: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              displayName: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
          profilePicUrl: true,
          bio: true,
          isVerified: true,
          _count: {
            select: {
              followers: true,
              following: true,
              posts: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [
          { isVerified: 'desc' }, // Verified users first
          { username: 'asc' }, // Then alphabetically
        ],
      }),
      prisma.user.count({
        where: {
          OR: [
            {
              username: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              displayName: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        },
      }),
    ]);

    return {
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        profilePicUrl: user.profilePicUrl,
        bio: user.bio,
        isVerified: user.isVerified,
        stats: {
          followers: user._count.followers,
          following: user._count.following,
          posts: user._count.posts,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new SearchService();
