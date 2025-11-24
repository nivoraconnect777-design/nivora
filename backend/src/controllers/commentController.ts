import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const toggleCommentLike = async (req: AuthRequest, res: Response) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const existingLike = await prisma.commentLike.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId,
                },
            },
        });

        if (existingLike) {
            await prisma.commentLike.delete({
                where: {
                    id: existingLike.id,
                },
            });
            res.status(200).json({ success: true, isLiked: false });
        } else {
            await prisma.commentLike.create({
                data: {
                    userId,
                    commentId,
                },
            });
            res.status(200).json({ success: true, isLiked: true });
        }
    } catch (error) {
        console.error('Toggle comment like error:', error);
        res.status(500).json({ success: false, message: 'Error toggling like' });
    }
};
