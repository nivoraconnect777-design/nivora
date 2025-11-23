import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getExplorePosts } from '../controllers/exploreController';

const router = Router();

router.get('/', authenticate, getExplorePosts);

export default router;
