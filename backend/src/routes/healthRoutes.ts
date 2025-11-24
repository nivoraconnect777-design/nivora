import express from 'express';
import prisma from '../config/database';

const router = express.Router();

router.get('/health', async (req, res) => {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        // Count posts
        const postCount = await prisma.post.count();

        // Count users
        const userCount = await prisma.user.count();

        res.json({
            success: true,
            status: 'healthy',
            database: {
                connected: true,
                postCount,
                userCount,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

export default router;
