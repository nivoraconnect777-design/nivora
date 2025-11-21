import { Router } from 'express';
import * as searchController from '../controllers/searchController';

const router = Router();

// Public search endpoint
router.get('/users', searchController.searchUsers);

export default router;
