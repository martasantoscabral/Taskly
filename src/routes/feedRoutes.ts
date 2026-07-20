import { Router } from 'express';
import {
  getFeedPostsController,
  getFeedPostByIdController,
  createFeedPostController,
  deleteFeedPostController,
  addLikeToPostController,
  removeLikeFromPostController,
  getCommentsByPostController,
  addCommentToPostController,
  deleteCommentFromPostController,
} from '../controllers/feedController.js';
import { authGuard } from '../middlewares/authGuard.js';

const router = Router();

router.get('/', authGuard, getFeedPostsController);
router.get('/:id', authGuard, getFeedPostByIdController);
router.post('/', authGuard, createFeedPostController);
router.delete('/:id', authGuard, deleteFeedPostController);

router.post('/:id/like', authGuard, addLikeToPostController);
router.delete('/:id/like', authGuard,removeLikeFromPostController);

router.get('/:id/comments', authGuard, getCommentsByPostController);
router.post('/:id/comments', authGuard, addCommentToPostController);
router.delete('/comments/:commentId', authGuard,deleteCommentFromPostController);

export default router;