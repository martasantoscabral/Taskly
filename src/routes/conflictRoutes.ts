import { Router } from 'express';
import {
  getConflictsByTaskController,
  getConflictByIdController,
  createConflictController,
  resolveConflictController,
} from '../controllers/conflictController.js';
import { authGuard } from '../middlewares/authGuard.js';

const router = Router();

router.get('/tarefa/:id', authGuard, getConflictsByTaskController);    //rota para listar conflitos por tarefa
router.get('/:id', authGuard, getConflictByIdController);              //rota para obter um conflito específico pelo ID
router.post('/', authGuard, createConflictController);                 //rota para criar um novo conflito manualmente
router.put('/:id/resolve', authGuard, resolveConflictController);      //rota para resolver um conflito existente

export default router;