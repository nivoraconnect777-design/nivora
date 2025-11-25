import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
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
                // Include related data if needed for display (e.g., post thumbnail)
                // Note: Prisma doesn't support conditional includes based on type easily in one go without raw query or separate fetches,
                // but we can try to include all potential relations if they are optional.
                // However, the schema has postId, commentId, etc. as simple fields.
                // We might need to fetch the actual post/comment data if we want to show thumbnails.
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            skip: skip,
        });

        // To get post thumbnails or comment text, we might need to do some post-processing
        // or include them in the query if the schema supports relations.
        // Looking at schema: Notification has postId, commentId, but NO direct relation defined in the Notification model 
        // to Post or Comment (except via the foreign keys if they were set up as relations).
        // Let's check the schema again.
        // Schema says:
        // postId      String?
        // reelId      String?
        // commentId   String?
        // It does NOT have @relation fields for these in the Notification model.
        // So we have to fetch them manually or update schema.
        // Updating schema is better for integrity, but for now I will fetch manually to avoid migration if possible,
        // OR I can just assume I need to fetch them. 
        // Actually, for a good UI, we need the Post thumbnail.

        // Let's do a quick enrichment.
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

export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Mark all as read for now, or specific ID if provided
        // For simple "Instagram like" behavior, opening the notifications tab often marks them as read, 
        // or we mark individual ones. Let's support marking all.

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
