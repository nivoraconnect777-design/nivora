import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import {
    createPost,
    getPosts,
    getPostById,
    deletePost,
} from '../controllers/postController';

const router = express.Router();

// All routes require authentication
router.use(authenticate as RequestHandler);

router.post('/', createPost as RequestHandler);
router.get('/', getPosts as RequestHandler);
router.get('/:id', getPostById as RequestHandler);
router.delete('/:id', deletePost as RequestHandler);

export default router;
