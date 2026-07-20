import { type Response } from 'express';
import * as taskService from '../services/taskService.js';
import { type AuthenticatedRequest } from '../middlewares/authGuard.js';
import {
  taskIdParamSchema,
  taskQuerySchema,
  taskCreateSchema,
  taskUpdateSchema,
} from '../schemas/taskSchema.js';
import { prisma } from '../lib/prisma.js';
/**
 * GET /api/tasks
 * Lista as tarefas do utilizador autenticado. 
 */
export const getTasksController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const queryResult = taskQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    return res.status(400).json({
      errors: queryResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
     const filters = {
      ...queryResult.data,
    };

    if (!queryResult.data.id_grupo) {
      filters.id_user =
        queryResult.data.id_user ??
        req.utilizador.id_utilizador;
    }

    const tasks = await taskService.getTasks(filters);
    return res.json(tasks);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    return res.status(500).json({ error: 'Erro ao listar tarefas' });
  }
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * GET /api/tasks/:id
 * Obtém uma tarefa específica pelo ID, se pertencer ao utilizador.
 */
export const getTaskByIdController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = taskIdParamSchema.safeParse(req.params);

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

    return res.json(task);
  } catch (error) {
    console.error('Erro ao obter tarefa:', error);
    return res.status(500).json({ error: 'Erro ao obter tarefa' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * POST /api/tasks
 * Cria uma nova tarefa para o utilizador autenticado.
 */
export const createTaskController = async (req: Request,res: Response) => {
  const bodyResult = taskCreateSchema.safeParse(req.body);

  // validação
  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) =>
          `${issue.path.join(".")}: ${issue.message}`
      ),
    });
  }

  try {
  // dados finais da tarefa
    const data = {
      ...bodyResult.data,
      id_user:
        bodyResult.data.id_user ??
        (req as any).utilizador.id_utilizador,

      dueDate: bodyResult.data.dueDate
        ? new Date(bodyResult.data.dueDate)
        : undefined,
    };

    // criar tarefa
    const newTask = await taskService.createTask(data);
    return res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao criar tarefa.",
    });
  }
};



/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * PUT /api/tasks/:id
 * Atualiza uma tarefa existente, se pertencer ao utilizador.
 */
export const updateTaskController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = taskIdParamSchema.safeParse(req.params);

  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  const bodyResult = taskUpdateSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const existingTask = await taskService.getTaskById(paramResult.data.id);

    if (!existingTask) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const isOwner = existingTask.id_user === req.utilizador.id_utilizador;
    const isAdmin = req.utilizador.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    const updatedTask = await taskService.updateTask(paramResult.data.id, {
      title: bodyResult.data.title,
      description: bodyResult.data.description,
      priority: bodyResult.data.priority,
      status: bodyResult.data.status,
      dueDate: bodyResult.data.dueDate ? new Date(bodyResult.data.dueDate) : undefined,
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return res.status(400).json({ error: 'Dados inválidos para atualizar tarefa' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * DELETE /api/tasks/:id
 * Remove uma tarefa, se pertencer ao utilizador.
 */
export const deleteTaskController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = taskIdParamSchema.safeParse(req.params);

  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const existingTask = await taskService.getTaskById(paramResult.data.id);

    if (!existingTask) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const isOwner = existingTask.id_user === req.utilizador.id_utilizador;
    const isAdmin = req.utilizador.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    await taskService.deleteTask(paramResult.data.id);
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover tarefa:', error);
    return res.status(500).json({ error: 'Erro ao remover tarefa' });
  }
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * POST /api/tasks/:id/merge
 * Cria um merge final para uma tarefa, se pertencer ao utilizador.
 */
export const uploadTaskPdfController = async (req: Request,res: Response) => {
  try {
    const taskId = Number((req as any).params.id);
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({
        error: "PDF obrigatório.",
      });
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        pdfName: file.originalname,
        pdfPath: file.buffer.toString("base64"),
      },
    });

    return res.json({
      message: "PDF guardado com sucesso.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro upload PDF.",
    });
  }
};