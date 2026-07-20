import { Router } from 'express';
import {
  getSubmissionsByTaskController,
  getSubmissionByIdController,
  createSubmissionController,
  deleteSubmissionController,
} from '../controllers/submissionController.js';
import { authGuard } from '../middlewares/authGuard.js';


//Cria uma instância do router do Express
const router = Router();

router.get('/:id/submissions', authGuard, getSubmissionsByTaskController);               //Rota para listar submissões de uma tarefa
router.get('/:id/submissions/:submissionId', authGuard, getSubmissionByIdController);    //Rota para obter detalhes de uma submissão específica
router.post('/:id/submissions', authGuard, createSubmissionController);                  //Rota para criar uma nova submissão para uma tarefa
router.delete('/:id/submissions/:submissionId', authGuard, deleteSubmissionController);  //Rota para remover uma submissão específica

export default router;