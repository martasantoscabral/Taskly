import { Router } from 'express';
import {
  getMergeByTaskController,
  createMergeController,
  downloadMergeController,
  getMergesByTaskController,
  getMergeByIdController,
  deleteMergeByIdController,
} from '../controllers/mergeController.js';
import { authGuard } from '../middlewares/authGuard.js';

const router = Router();

router.get('/:id/merge', authGuard, getMergeByTaskController);         //rota para obter o merge final de uma tarefa
router.get('/:id/merge/download', authGuard, downloadMergeController); //rota para descarregar o merge final de uma tarefa
router.get('/:id/merges', authGuard, getMergesByTaskController);       //rota para obter todos os merges finais de uma tarefa  
router.get('/:id', authGuard, getMergeByIdController);              //rota para obter um merge específico pelo seu ID
router.delete('/:id', authGuard, deleteMergeByIdController);              //rota para obter um merge específico pelo seu ID
router.post("/:id/merge", authGuard, createMergeController as any); //rota para criar um merge final de uma tarefa
export default router;