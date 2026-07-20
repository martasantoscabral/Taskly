import { type Request, type Response } from 'express';
import * as notificationService from '../services/notificationService.js';
import { type AuthenticatedRequest } from '../middlewares/authGuard.js';
import {
  notificationIdParamSchema,
  notificationCreateSchema,
  notificationGroupCreateSchema,
  notificationGroupDeleteSchema,
  getAllNotificationGroupSchema
} from '../schemas/notificationSchema.js';


/**
 * GET /api/notifications
 * Lista todas as notificações
 */
export const getNotificationsController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  try {
    const notifications = await notificationService.getNotifications(
      req.utilizador.id_utilizador
    );
    return res.json(notifications);
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    return res.status(500).json({ error: 'Erro ao listar notificações' });
  }
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/** 
 * GET /api/notifications/:id
 * Busca uma notificação por ID
 */
export const getNotificationByIdController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = notificationIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const notification = await notificationService.getNotificationById(
      paramResult.data.id,
      req.utilizador.id_utilizador
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    return res.json(notification);
  } catch (error) {
    console.error('Erro ao obter notificação:', error);
    return res.status(500).json({ error: 'Erro ao obter notificação' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * POST /api/notifications
 * Cria uma nova notificação para um utilizador --> so admin ou sistema
 */
export const createNotificationController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  if (req.utilizador.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  const bodyResult = notificationCreateSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const newNotification = await notificationService.createNotification(
      bodyResult.data.id_user,
      bodyResult.data.tipo,
      bodyResult.data.mensagem
    );

    return res.status(201).json(newNotification);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return res.status(400).json({ error: 'Dados inválidos' });
  }
};



/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * PUT /api/notifications/:id/read
 * Marca uma notificação como lida
 */
export const markNotificationAsReadController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = notificationIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const updatedNotification = await notificationService.markNotificationAsRead(
      paramResult.data.id,
      req.utilizador.id_utilizador
    );
    return res.json(updatedNotification);
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return res.status(404).json({ error: 'Notificação não encontrada' });
  }
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * PUT /api/notifications/read-all
 * Marca todas as notificações como lidas
 */
export const markAllNotificationsAsReadController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  try {
    const result = await notificationService.markAllNotificationsAsRead(
      req.utilizador.id_utilizador
    );
    return res.json(result);
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    return res.status(500).json({ error: 'Erro ao marcar notificações como lidas' });
  }
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * DELETE /api/notifications/:id
 * Exclui uma notificação por ID
 */
export const deleteNotificationController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = notificationIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    await notificationService.deleteNotification(
      paramResult.data.id,
      req.utilizador.id_utilizador
    );
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover notificação:', error);
    return res.status(404).json({ error: 'Notificação não encontrada' });
  }
};

export const createNotificationGroupController = async (req: AuthenticatedRequest, res: Response) => {
  const bodyResult = notificationGroupCreateSchema.safeParse(req.body);
  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }
  try {
    const newNotification = await notificationService.createNotificationGroup(
      bodyResult.data.grupo_id,
      bodyResult.data.msg,
      bodyResult.data.file
    );

    return res.status(201).json(newNotification);
  } catch (error) {
    console.error('Erro ao criar notificação de grupo:', error);
    return res.status(400).json({ error: 'Dados inválidos' });
  }
};

export const deleteNotificationGroupController = async (req:AuthenticatedRequest, res: Response) => {
  const bodyResult = notificationGroupDeleteSchema.safeParse(req.params)
  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }
  try {
    const deleteGroupNotification = await notificationService.deleteAllNotificationGroup(
      bodyResult.data.grupo_id
    );
    return deleteGroupNotification
  } catch(error)
  {{
    console.error('Erro ao eliminar notificações do grupo:', error);
    return res.status(400).json({ error: 'Dados inválidos' });
  }}
};

export const getAllNotificationGroupController = async (req:AuthenticatedRequest, res: Response) => {
  const bodyResult = getAllNotificationGroupSchema.safeParse(req.params)
  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }
  try {
    const AllNotificationGroup = await notificationService.getAllNotificationGroup(
      bodyResult.data.grupo_id
    );
    return res.status(200).json(AllNotificationGroup)
  } catch(error)
  {{
    console.error('Erro procurar as mensagens do Grupo:', error);
    return res.status(400).json({ error: 'Dados inválidos' });
  }}
};