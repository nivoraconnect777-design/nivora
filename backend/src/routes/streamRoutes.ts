import { Router } from 'express';
import { generateToken } from '../controllers/streamController';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/stream/token - Generate a Stream Chat token for the current user
router.post('/token', authenticate, generateToken);

export default router;
