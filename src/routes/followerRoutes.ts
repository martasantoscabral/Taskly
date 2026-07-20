import { Router } from 'express';
import {
  getFollowersByUserController,
  getFollowingByUserController,
  followUserController,
  unfollowUserController,
} from '../controllers/followerController.js';
import { authGuard } from '../middlewares/authGuard.js';

const router = Router();

router.get('/:id/followers', authGuard, getFollowersByUserController);
router.get('/:id/following', authGuard, getFollowingByUserController);
router.post('/follow', authGuard, followUserController);
router.delete('/unfollow', authGuard, unfollowUserController);

export default router;