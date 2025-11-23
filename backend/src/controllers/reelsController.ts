import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getReels = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const reels = await prisma.post.findMany({
            where: {
                mediaType: 'video', // Only fetch videos
            },
            take: limit,
            skip: skip,
            orderBy: {
                createdAt: 'desc',
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

        const formattedReels = reels.map((reel) => ({
            ...reel,
            isLiked: reel.likes.length > 0,
            likes: undefined,
        }));

        res.json({
            status: 'success',
            data: {
                reels: formattedReels,
                hasMore: reels.length === limit,
            },
        });
    } catch (error) {
        console.error('Get reels error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching reels',
        });
    }
};
