import { Router } from 'express';
import {
  getUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController,
} from '../controllers/userController.js';
import { authGuard } from '../middlewares/authGuard.js';

const router = Router();

router.get('/', authGuard, getUsersController);
router.get('/:id', authGuard, getUserByIdController);
router.post('/', createUserController);
router.put('/:id', authGuard, updateUserController);
router.delete('/:id', authGuard, deleteUserController);

export default router;
