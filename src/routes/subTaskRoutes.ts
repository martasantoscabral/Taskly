import { Router } from 'express';
import {
  getSubTasksByTaskController,
  getSubTaskByIdController,
  createSubTaskController,
  updateSubTaskController,
  deleteSubTaskController,
} from '../controllers/subTaskController.js';
import { authGuard } from '../middlewares/authGuard.js';

const router = Router();

router.get('/:id/subtasks', authGuard, getSubTasksByTaskController);                   //rota para obter todas as subtarefas de uma tarefa específica
router.get('/:id/subtasks/:subtaskId', authGuard, getSubTaskByIdController);           //rota para obter uma subtarefa específica de uma tarefa
router.post('/:id/subtasks', authGuard, createSubTaskController);                      //rota para criar uma nova subtarefa para uma tarefa específica
router.put('/:id/subtasks/:subtaskId', authGuard, updateSubTaskController);            //rota para atualizar uma subtarefa específica de uma tarefa
router.delete('/:id/subtasks/:subtaskId', authGuard, deleteSubTaskController);         //rota para deletar uma subtarefa específica de uma tarefa

export default router;