import { Request, Response } from 'express';
import prisma from '../config/database';
import mediaService from '../services/mediaService';

// Helper interface for authenticated request
interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        [key: string]: any;
    };
}

// Create a new story
export const createStory = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user!.id;
        const { mediaUrl, mediaType, duration } = req.body;

        if (!mediaUrl || !mediaType) {
            return res.status(400).json({
                status: 'error',
                message: 'Media URL and type are required',
            });
        }

        // Set expiration to 24 hours from now
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const story = await prisma.story.create({
            data: {
                userId,
                mediaUrl,
                mediaType,
                duration: duration || 5000, // Default 5s for images
                expiresAt,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profilePicUrl: true,
                    },
                },
            },
        });

        res.status(201).json({
            status: 'success',
            data: story,
        });
    } catch (error) {
        console.error('Create story error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create story',
        });
    }
};

// Get stories feed (followed users + self)
export const getStoriesFeed = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.id;

        if (!userId) {
            console.error('Get stories feed error: User ID missing from request');
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }

        console.log(`Fetching stories feed for user: ${userId}`);

        // Get list of users followed by current user
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });

        const followingIds = following.map((f) => f.followingId);
        // Include self in the feed
        const targetUserIds = [...followingIds, userId];

        console.log(`Target user IDs for stories: ${targetUserIds.length}`);

        // Fetch active stories
        const stories = await prisma.story.findMany({
            where: {
                userId: { in: targetUserIds },
                expiresAt: { gt: new Date() }, // Only active stories
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profilePicUrl: true,
                    },
                },
                views: {
                    where: { viewerId: userId },
                    select: { id: true }, // Check if current user viewed
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        console.log(`Found ${stories.length} active stories`);

        // Group stories by user
        const storiesByUser: Record<string, any> = {};

        stories.forEach((story) => {
            if (!storiesByUser[story.userId]) {
                storiesByUser[story.userId] = {
                    user: story.user,
                    stories: [],
                    hasUnseen: false,
                };
            }

            const isViewed = story.views.length > 0;
            storiesByUser[story.userId].stories.push({
                ...story,
                isViewed,
            });

            if (!isViewed) {
                storiesByUser[story.userId].hasUnseen = true;
            }
        });

        // Convert to array and sort:
        // 1. Current user first
        // 2. Users with unseen stories
        // 3. Recently updated
        const feed = Object.values(storiesByUser).sort((a, b) => {
            if (a.user.id === userId) return -1;
            if (b.user.id === userId) return 1;
            if (a.hasUnseen && !b.hasUnseen) return -1;
            if (!a.hasUnseen && b.hasUnseen) return 1;
            return 0;
        });

        res.json({
            status: 'success',
            try {
                const userId = (req as AuthRequest).user!.id;
                const { id } = req.params;

                // Check if already viewed
                const existingView = await prisma.storyView.findUnique({
                    where: {
                        storyId_viewerId: {
                            storyId: id,
                            viewerId: userId,
                        },
                    },
                });

                if(!existingView) {
                    await prisma.storyView.create({
                        data: {
                            storyId: id,
                            viewerId: userId,
                        },
                    });
                }

        res.json({
                    status: 'success',
                    message: 'Story marked as viewed',
                });
            } catch(error) {
                console.error('Mark story viewed error:', error);
                res.status(500).json({
                    status: 'error',
                    message: 'Failed to mark story as viewed',
                });
            }
        };

        // Get viewers of a story (for own stories)
        export const getStoryViewers = async (req: Request, res: Response) => {
            try {
                const userId = (req as AuthRequest).user!.id;
                const { id } = req.params;

                const story = await prisma.story.findUnique({
                    where: { id },
                    select: { userId: true },
                });

                if (!story) {
                    return res.status(404).json({
                        status: 'error',
                        message: 'Story not found',
                    });
                }

                if (story.userId !== userId) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Unauthorized to view these stats',
                    });
                }

                const viewers = await prisma.storyView.findMany({
                    where: { storyId: id },
                    include: {
                        viewer: {
                            select: {
                                id: true,
                                username: true,
                                profilePicUrl: true,
                                displayName: true,
                            },
                        },
                    },
                    orderBy: { viewedAt: 'desc' },
                });

                res.json({
                    status: 'success',
                    data: viewers.map((v) => ({
                        user: v.viewer,
                        viewedAt: v.viewedAt,
                    })),
                });
            } catch (error) {
                console.error('Get story viewers error:', error);
                res.status(500).json({
                    status: 'error',
                    message: 'Failed to fetch viewers',
                });
            }
        };

        // Delete a story
        export const deleteStory = async (req: Request, res: Response) => {
            try {
                const userId = (req as AuthRequest).user!.id;
                const { id } = req.params;

                const story = await prisma.story.findUnique({
                    where: { id },
                });

                if (!story) {
                    return res.status(404).json({
                        status: 'error',
                        message: 'Story not found',
                    });
                }

                if (story.userId !== userId) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Unauthorized',
                    });
                }

                await prisma.story.delete({
                    where: { id },
                });

                res.json({
                    status: 'success',
                    message: 'Story deleted',
                });
            } catch (error) {
                console.error('Delete story error:', error);
                res.status(500).json({
                    status: 'error',
                    message: 'Failed to delete story',
                });
            }
        };
