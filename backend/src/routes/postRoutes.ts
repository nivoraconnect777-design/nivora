import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import {
    createPost,
    getPosts,
    getPostById,
    deletePost,
    toggleLike,
    addComment,
    getComments,
    updatePost,
} from '../controllers/postController';
import { toggleCommentLike } from '../controllers/commentController';

const router = express.Router();

// All routes require authentication
router.use(authenticate as RequestHandler);

router.post('/', createPost as RequestHandler);
router.get('/', getPosts as RequestHandler);
router.get('/:id', getPostById as RequestHandler);
router.delete('/:id', deletePost as RequestHandler);
router.post('/:id/like', toggleLike as RequestHandler);
router.post('/:id/comments', addComment as RequestHandler);
router.get('/:id/comments', getComments as RequestHandler);
router.post('/comments/:commentId/like', toggleCommentLike as RequestHandler);
router.put('/:id', updatePost as RequestHandler);

export default router;
