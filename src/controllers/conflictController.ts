import { type Response } from 'express';
import * as conflictService from '../services/conflictService.js';
import * as taskService from '../services/taskService.js';
import { type AuthenticatedRequest } from '../middlewares/authGuard.js';
import {
  conflictIdParamSchema,
  conflictTaskIdParamSchema,
  conflictCreateSchema,
  conflictResolveSchema,
} from '../schemas/conflictSchema.js';

/**
 * GET /api/conflicts/tarefa/:id
 * Listar conflitos por tarefa
 */
export const getConflictsByTaskController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = conflictTaskIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const task = await taskService.getTaskById(paramResult.data.id);
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const isOwner = task.id_user === req.utilizador.id_utilizador;
    const isAdmin = req.utilizador.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    const conflicts = await conflictService.getConflictsByTask(paramResult.data.id);
    return res.json(conflicts);
  } catch (error) {
    console.error('Erro ao listar conflitos:', error);
    return res.status(500).json({ error: 'Erro ao listar conflitos' });
  }
};

/**
 * GET /api/conflicts/:id
 * Obtem um conflito específico pelo ID
 */
export const getConflictByIdController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = conflictIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const conflict = await conflictService.getConflictById(paramResult.data.id);
    if (!conflict) {
      return res.status(404).json({ error: 'Conflito não encontrado' });
    }

    const task = await taskService.getTaskById(conflict.id_tarefa);
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const isOwner = task.id_user === req.utilizador.id_utilizador;
    const isAdmin = req.utilizador.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    return res.json(conflict);
  } catch (error) {
    console.error('Erro ao obter conflito:', error);
    return res.status(500).json({ error: 'Erro ao obter conflito' });
  }
};

/**
 * POST /api/conflicts
 * Criar um novo conflito manualmente
 */
export const createConflictController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const bodyResult = conflictCreateSchema.safeParse(req.body);
  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const task = await taskService.getTaskById(bodyResult.data.id_tarefa);
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const isOwner = task.id_user === req.utilizador.id_utilizador;
    const isAdmin = req.utilizador.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    const newConflict = await conflictService.createConflict(
      bodyResult.data.id_tarefa,
      bodyResult.data.nome_ficheiro,
      req.utilizador.id_utilizador,
      bodyResult.data.mensagem_commit,
      bodyResult.data.status
    );

    return res.status(201).json(newConflict);
  } catch (error) {
    console.error('Erro ao criar conflito:', error);
    return res.status(400).json({ error: 'Dados inválidos para criar conflito' });
  }
};

/**
 * PUT /api/conflicts/:id/resolve
 * Resolver um conflito existente
 */
export const resolveConflictController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = conflictIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  const bodyResult = conflictResolveSchema.safeParse(req.body);
  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const conflict = await conflictService.getConflictById(paramResult.data.id);
    if (!conflict) {
      return res.status(404).json({ error: 'Conflito não encontrado' });
    }

    const task = await taskService.getTaskById(conflict.id_tarefa);
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const isOwner = task.id_user === req.utilizador.id_utilizador;
    const isAdmin = req.utilizador.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    const updatedConflict = await conflictService.resolveConflict(
      paramResult.data.id,
      bodyResult.data.id_versao_escolhida ?? null,
      bodyResult.data.status
    );

    return res.json(updatedConflict);
  } catch (error) {
    console.error('Erro ao resolver conflito:', error);
    return res.status(404).json({ error: 'Conflito não encontrado ou dados inválidos' });
  }
};