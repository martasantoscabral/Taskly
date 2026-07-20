import { type Response } from 'express';
import * as submissionService from '../services/submissionService.js';
import * as taskService from '../services/taskService.js';
import { type AuthenticatedRequest } from '../middlewares/authGuard.js';
import {
  submissionTaskIdParamSchema,
  submissionIdsParamSchema,
  submissionCreateSchema,
} from '../schemas/submissionSchema.js';


/**
 * GET /api/tasks/:id/submissions
 * Lista todas as submissões de uma tarefa específica.
*/
export const getSubmissionsByTaskController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = submissionTaskIdParamSchema.safeParse(req.params);

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

    const submissions = await submissionService.getSubmissionsByTask(paramResult.data.id);
    return res.json(submissions);
  } catch (error) {
    console.error('Erro ao listar submissões:', error);
    return res.status(500).json({ error: 'Erro ao listar submissões' });
  }
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * GET /api/tasks/:id/submissions/:submissionId
 * Obtém os detalhes de uma submissão específica por ID.
*/
export const getSubmissionByIdController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = submissionIdsParamSchema.safeParse(req.params);

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

    const submission = await submissionService.getSubmissionById(
      paramResult.data.id,
      paramResult.data.submissionId
    );

    if (!submission) {
      return res.status(404).json({ error: 'Submissão não encontrada' });
    }

    return res.json(submission);
  } catch (error) {
    console.error('Erro ao obter submissão:', error);
    return res.status(500).json({ error: 'Erro ao obter submissão' });
  }
};



/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * POST /api/tasks/:id/submissions
 * Cria uma nova submissão para uma tarefa.
*/
export const createSubmissionController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const taskParamResult = submissionTaskIdParamSchema.safeParse(req.params);
  const bodyResult = submissionCreateSchema.safeParse(req.body);

  if (!taskParamResult.success) {
    return res.status(400).json({
      errors: taskParamResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const task = await taskService.getTaskById(taskParamResult.data.id);
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const isOwner = task.id_user === req.utilizador.id_utilizador;
    const isAdmin = req.utilizador.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }
    const newSubmission = await submissionService.createSubmission(
      req.utilizador.id_utilizador,
      bodyResult.data.nome,
      taskParamResult.data.id,
      bodyResult.data.nome_ficheiro,
      bodyResult.data.file_path,
      bodyResult.data.mensagem_commit
    );
    return res.status(201).json(newSubmission);
  } catch (error) {
    console.error('Erro ao criar submissão:', error);
    return res.status(400).json({ error: 'Dados inválidos' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * DELETE /api/tasks/:id/submissions/:submissionId
 * Remove uma submissão específica por ID.
*/
export const deleteSubmissionController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }
  const paramResult = submissionIdsParamSchema.safeParse(req.params);
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
    await submissionService.deleteSubmission(
      paramResult.data.id,
      paramResult.data.submissionId
    );

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover submissão:', error);
    return res.status(404).json({ error: 'Submissão não encontrada' });
  }
};