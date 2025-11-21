import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/:username', userController.getUserProfile);

// Protected routes
router.put('/profile/update', authenticate, userController.updateProfile);
router.get('/check-username/:username', authenticate, userController.checkUsername);

export default router;
