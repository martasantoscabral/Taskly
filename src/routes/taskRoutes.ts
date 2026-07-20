import { Router } from 'express';
import {
  getTasksController,
  getTaskByIdController,
  createTaskController,
  updateTaskController,
  deleteTaskController,
  uploadTaskPdfController,
} from '../controllers/taskController.js';
import { authGuard } from '../middlewares/authGuard.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authGuard, getTasksController);            //rota para listar as tarefas,  filtros (id_user, status, priority)
router.get('/:id', authGuard, getTaskByIdController);      //rota para obter uma tarefa específica pelo ID
router.post('/', authGuard, createTaskController);         //rota para criar uma nova tarefa, recebendo os dados no corpo da requisição
router.put('/:id', authGuard, updateTaskController);       //rota para atualizar uma tarefa existente, recebendo os dados a serem atualizados no corpo da requisição
router.delete('/:id', authGuard, deleteTaskController);    //rota para deletar uma tarefa pelo ID
router.post("/:id/pdf", authGuard,upload.single("pdf"),uploadTaskPdfController as any);
export default router;