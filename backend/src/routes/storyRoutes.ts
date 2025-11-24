import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    createStory,
    getStoriesFeed,
    markStoryViewed,
    getStoryViewers,
    deleteStory,
} from '../controllers/storyController';

const router = Router();

router.post('/', authenticate, createStory);
router.get('/feed', authenticate, getStoriesFeed);
router.post('/:id/view', authenticate, markStoryViewed);
router.get('/:id/viewers', authenticate, getStoryViewers);
router.delete('/:id', authenticate, deleteStory);

export default router;
