import express from 'express';
import { getNotifications, markAsRead, getUnreadCount, subscribe, triggerPush } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.put('/read', authenticate, markAsRead);
router.post('/subscribe', authenticate, subscribe);
router.post('/trigger-push', authenticate, triggerPush);

export default router;
