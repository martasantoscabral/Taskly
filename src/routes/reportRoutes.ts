import { Router } from 'express';
import {
  getReportsController,
  getReportByIdController,
  createReportController,
  updateReportStatusController,
  deleteReportController,
  resolveReportController,
  suspendUserFromReportController,
  deleteTaskFromReportController

} from '../controllers/reportController.js';
import { authGuard } from '../middlewares/authGuard.js';

const router = Router();

router.get('/', authGuard, getReportsController);                    //rota para listar todos os reports
router.get('/:id', authGuard, getReportByIdController);              //Rota para obter detalhes de um report específico pelo ID
router.post('/', authGuard, createReportController);                 //Rota para criar um novo report
router.put('/:id/status', authGuard, updateReportStatusController);  //Rota para atualizar o status de um report específico
router.delete('/:id', authGuard, deleteReportController);            //Rota para remover um report específico

router.patch('/:id/resolve', authGuard, resolveReportController);
router.patch('/:id/suspend', authGuard, suspendUserFromReportController);
router.delete('/:id/task', authGuard, deleteTaskFromReportController);


export default router;