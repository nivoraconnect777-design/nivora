import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getReels } from '../controllers/reelsController';

const router = Router();

router.get('/', authenticate, getReels);

export default router;
