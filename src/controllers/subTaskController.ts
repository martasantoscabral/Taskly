import { type Response } from 'express';
import * as subTaskService from '../services/subTaskService.js';
import * as taskService from '../services/taskService.js';
import { type AuthenticatedRequest } from '../middlewares/authGuard.js';
import {
  subTaskTaskIdParamSchema,
  subTaskIdsParamSchema,
  subTaskCreateSchema,
  subTaskUpdateSchema,
} from '../schemas/subTaskSchema.js';

export const getSubTasksByTaskController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const params = subTaskTaskIdParamSchema.safeParse(req.params);

  if (!params.success) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const task = await taskService.getTaskById(params.data.id);

  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }

  const isOwner = task.id_user === req.utilizador.id_utilizador;
  const isAdmin = req.utilizador.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  const data = await subTaskService.getSubTasksByTask(params.data.id);
  return res.json(data);
};

export const getSubTaskByIdController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const params = subTaskIdsParamSchema.safeParse(req.params);

  if (!params.success) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const task = await taskService.getTaskById(params.data.id);

  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }

  const isOwner = task.id_user === req.utilizador.id_utilizador;
  const isAdmin = req.utilizador.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  const subtask = await subTaskService.getSubTaskById(
    params.data.id,
    params.data.subtaskId
  );

  if (!subtask) {
    return res.status(404).json({ error: 'SubTask não encontrada' });
  }

  return res.json(subtask);
};

export const createSubTaskController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const params = subTaskTaskIdParamSchema.safeParse(req.params);
  const body = subTaskCreateSchema.safeParse(req.body);

  if (!params.success || !body.success) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  const task = await taskService.getTaskById(params.data.id);

  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }

  const isOwner = task.id_user === req.utilizador.id_utilizador;
  const isAdmin = req.utilizador.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  const newSubTask = await subTaskService.createSubTask(
    params.data.id,
    body.data.titulo,
    body.data.concluida
  );

  return res.status(201).json(newSubTask);
};

export const updateSubTaskController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const params = subTaskIdsParamSchema.safeParse(req.params);
  const body = subTaskUpdateSchema.safeParse(req.body);

  if (!params.success || !body.success) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  const task = await taskService.getTaskById(params.data.id);

  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }

  const isOwner = task.id_user === req.utilizador.id_utilizador;
  const isAdmin = req.utilizador.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  try {
    const updated = await subTaskService.updateSubTask(
      params.data.id,
      params.data.subtaskId,
      body.data
    );

    return res.json(updated);
  } catch {
    return res.status(404).json({ error: 'SubTask não encontrada' });
  }
};

export const deleteSubTaskController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const params = subTaskIdsParamSchema.safeParse(req.params);

  if (!params.success) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const task = await taskService.getTaskById(params.data.id);

  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }

  const isOwner = task.id_user === req.utilizador.id_utilizador;
  const isAdmin = req.utilizador.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  try {
    await subTaskService.deleteSubTask(
      params.data.id,
      params.data.subtaskId
    );

    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: 'SubTask não encontrada' });
  }
};