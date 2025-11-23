import { Router } from 'express';
import * as mediaController from '../controllers/mediaController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected routes
router.post('/upload-signature', authenticate, mediaController.getUploadSignature);

export default router;
