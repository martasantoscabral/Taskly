import { Router } from 'express';
import {
    getNotificationsController,
    getNotificationByIdController,
    createNotificationController,
    markNotificationAsReadController,
    markAllNotificationsAsReadController,
    deleteNotificationController,
    createNotificationGroupController,
    deleteNotificationGroupController,
    getAllNotificationGroupController
} from '../controllers/notificationController.js';
import { authGuard } from '../middlewares/authGuard.js';

const router = Router();

router.get('/', authGuard, getNotificationsController);                    //rota para listar todas as notificações
router.get('/:id', authGuard, getNotificationByIdController);              //rota para obter uma notificação por ID
router.post('/', authGuard, createNotificationController);                 //rota para criar uma nova notificação
router.put('/:id/read', authGuard, markNotificationAsReadController);      //rota para marcar uma notificação como lida
router.put('/read-all', authGuard, markAllNotificationsAsReadController);  //rota para marcar todas as notificações como lidas
router.delete('/:id', authGuard, deleteNotificationController);   
router.post('/group', authGuard, createNotificationGroupController)
router.delete('/group/delete/:id', authGuard, deleteNotificationGroupController)
router.get('/group/messages', authGuard, getAllNotificationGroupController)         //rota para eliminar uma notificação por ID

export default router;