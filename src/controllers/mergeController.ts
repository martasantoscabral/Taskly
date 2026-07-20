import { type Response } from 'express';
import { PDFDocument } from 'pdf-lib';
import { prisma } from '../lib/prisma.js';

import * as mergeService from '../services/mergeService.js';
import * as taskService from '../services/taskService.js';
import { type AuthenticatedRequest } from '../middlewares/authGuard.js';
import {
  mergeTaskIdParamSchema,
  mergeIdParamSchema,
  mergeCreateSchema,
} from '../schemas/mergeSchema.js';



/*
 * GET /api/tasks/:id/merge
 * Obtem o merge final de uma tarefa específica
 */
export const getMergeByTaskController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = mergeTaskIdParamSchema.safeParse(req.params);

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

    const merge = await mergeService.getMergeByTask(paramResult.data.id);
    if (!merge) {
      return res.status(404).json({ error: 'Merge não encontrado' });
    }

    return res.json(merge);
  } catch (error) {
    console.error('Erro ao obter merge:', error);
    return res.status(500).json({ error: 'Erro ao obter merge' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/* 
 * POST /api/tasks/:id/merge
 * Cria um merge final para uma tarefa
 */
export const createMergeController = async (req: Request, res: Response) => {
  try {
    const id_tarefa = Number((req as any).params.id);
    const userId =
      (req as any).utilizador?.id_utilizador ||
      (req as any).utilizador?.id;


    const { taskIds } = (req as any).body;
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ error: "Nenhuma tarefa escolhida." });
    }

    const tarefas = await prisma.task.findMany({
      where: {
        id: {
          in: taskIds.map(Number),
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const finalPdf = await PDFDocument.create();

    for (const tarefa of tarefas) {
      const pdfBuffer = Buffer.from(tarefa.pdfPath!, "base64");
      const pdf = await PDFDocument.load(pdfBuffer);
      const pages = await finalPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => finalPdf.addPage(page));
    }

    const mergedBytes = await finalPdf.save();
    const ficheirosIncluidos = tarefas
      .map((t) => t.pdfName || `tarefa-${t.id}.pdf`)
      .join(", ");

    const tamanho = `${mergedBytes.length} bytes`;
    await mergeService.createMerge(
      id_tarefa,
      userId,
      tamanho,
      ficheirosIncluidos
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="relatorio-final.pdf"'
    );
    return res.send(Buffer.from(mergedBytes));
  } catch (error) {
    console.error("Erro ao criar merge PDF:", error);
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * GET /api/tasks/:id/merge/download
 * Descarrega o merge final de uma tarefa
 */
export const downloadMergeController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = mergeTaskIdParamSchema.safeParse(req.params);
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

    const merge = await mergeService.getMergeByTask(paramResult.data.id);
    if (!merge) {
      return res.status(404).json({ error: 'Merge não encontrado' });
    }

    return res.json({
      mensagem: 'Merge final disponível para download',
      merge,
    });
  } catch (error) {
    console.error('Erro ao descarregar merge:', error);
    return res.status(500).json({ error: 'Erro ao descarregar merge' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * GET /api/tasks/:id/merges
 * Obtem todos os merges finais de uma tarefa específica
 */
export const getMergesByTaskController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = mergeTaskIdParamSchema.safeParse(req.params);

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

    const merges = await mergeService.getMergesByTask(paramResult.data.id);
    return res.json(merges);
  } catch (error) {
    console.error('Erro ao listar merges da tarefa:', error);
    return res.status(500).json({ error: 'Erro ao listar merges da tarefa' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * GET /api/merges/:id
 * Obtem um merge específico pelo seu ID
 */
export const getMergeByIdController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = mergeIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const merge = await mergeService.getMergeById(paramResult.data.id);
    if (!merge) {
      return res.status(404).json({ error: 'Merge não encontrado' });
    }

    const task = await taskService.getTaskById(merge.id_tarefa);
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const isOwner = task.id_user === req.utilizador.id_utilizador;
    const isAdmin = req.utilizador.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    return res.json(merge);
  } catch (error) {
    console.error('Erro ao obter merge:', error);
    return res.status(500).json({ error: 'Erro ao obter merge' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * DELETE /api/merges/:id
 * Remove um merge específico pelo ID.
 */
export const deleteMergeByIdController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = mergeIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const merge = await mergeService.getMergeById(paramResult.data.id);
    if (!merge) {
      return res.status(404).json({ error: 'Merge não encontrado' });
    }

    const task = await taskService.getTaskById(merge.id_tarefa);
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const isOwner = task.id_user === req.utilizador.id_utilizador;
    const isAdmin = req.utilizador.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    await mergeService.deleteMergeById(paramResult.data.id);
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover merge:', error);
    return res.status(404).json({ error: 'Merge não encontrado' });
  }
};