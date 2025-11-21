import { Router } from 'express';
import * as followController from '../controllers/followController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All follow routes require authentication
router.post('/:id/follow', authenticate, followController.followUser);
router.delete('/:id/follow', authenticate, followController.unfollowUser);
router.get('/:id/followers', followController.getFollowers);
router.get('/:id/following', followController.getFollowing);
router.get('/:id/follow-status', authenticate, followController.checkFollowStatus);

export default router;
