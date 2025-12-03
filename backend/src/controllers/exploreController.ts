import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { redis, CACHE_TTL } from '../config/redisClient';

const prisma = new PrismaClient();

export const getExplorePosts = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        // Try to get from cache if Redis is available
        if (redis) {
            const cacheKey = `explore:${page}:${limit}`;
            const cachedPosts = await redis.get(cacheKey);

            if (cachedPosts) {
                return res.json({
                    status: 'success',
                    data: {
                        posts: cachedPosts,
                        hasMore: (cachedPosts as any[]).length === limit,
                    },
                });
            }
        }

        // Get list of users the current user follows
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });

        const followingIds = following.map((f) => f.followingId);

        // Add current user to exclusion list
        followingIds.push(userId);

        // Fetch posts from users NOT in the following list
        const posts = await prisma.post.findMany({
            where: {
                userId: {
                    notIn: followingIds,
                },
            },
            take: limit,
            skip: skip,
            orderBy: {
                createdAt: 'desc', // Show newest first for now (can be changed to likesCount for trending)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        profilePicUrl: true,
                        isVerified: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
                likes: {
                    where: {
                        userId: userId,
                    },
                    select: {
                        userId: true,
                    },
                },
            },
        });

        // Format posts to include isLiked boolean
        const formattedPosts = posts.map((post) => ({
            ...post,
            isLiked: post.likes.length > 0,
            likes: undefined, // Remove the raw likes array
        }));

        // Cache the result if Redis is available
        if (redis) {
            const cacheKey = `explore:${page}:${limit}`;
            await redis.set(cacheKey, JSON.stringify(formattedPosts), { ex: CACHE_TTL.EXPLORE });
        }

        res.json({
            status: 'success',
            data: {
                posts: formattedPosts,
                hasMore: posts.length === limit,
            },
        });
    } catch (error) {
        console.error('Get explore posts error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching explore posts',
        });
    }
};
