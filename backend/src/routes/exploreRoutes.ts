import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getExplorePosts } from '../controllers/exploreController';

const router = Router();

router.get('/', authenticate, getExplorePosts);

export default router;
