import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.put('/read', authenticate, markAsRead);

export default router;
