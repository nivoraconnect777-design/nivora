import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { saveSubscription } from '../services/notificationService';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const notifications = await prisma.notification.findMany({
            where: {
                recipientId: userId,
            },
            include: {
                actor: {
                    select: {
                        id: true,
                        username: true,
                        profilePicUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            skip: skip,
        });

        // Enrich notifications with post/comment data
        const enrichedNotifications = await Promise.all(notifications.map(async (notif) => {
            let additionalData: any = {};

            if (notif.postId) {
                const post = await prisma.post.findUnique({
                    where: { id: notif.postId },
                    select: { mediaUrl: true, thumbnailUrl: true }
                });
                if (post) additionalData.post = post;
            }

            if (notif.commentId) {
                const comment = await prisma.comment.findUnique({
                    where: { id: notif.commentId },
                    select: { text: true, postId: true }
                });
                if (comment) {
                    additionalData.comment = comment;
                    // If it's a comment notification, we also want the post thumbnail
                    if (comment.postId && !additionalData.post) {
                        const post = await prisma.post.findUnique({
                            where: { id: comment.postId },
                            select: { mediaUrl: true, thumbnailUrl: true }
                        });
                        if (post) additionalData.post = post;
                    }
                }
            }

            return {
                ...notif,
                ...additionalData
            };
        }));

        res.status(200).json({ success: true, notifications: enrichedNotifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Error fetching notifications' });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        await prisma.notification.updateMany({
            where: {
                recipientId: userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        res.status(200).json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Mark notifications read error:', error);
        res.status(500).json({ success: false, message: 'Error marking notifications as read' });
    }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const count = await prisma.notification.count({
            where: {
                recipientId: userId,
                isRead: false,
            },
        });

        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ success: false, message: 'Error fetching unread count' });
    }
};

export const subscribe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const subscription = req.body;
        await saveSubscription(userId, subscription);

        res.status(201).json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ success: false, message: 'Error processing subscription' });
    }
};

