import { type Response } from 'express';
import * as reportService from '../services/reportService.js';
import { type AuthenticatedRequest } from '../middlewares/authGuard.js';
import {
  reportIdParamSchema,
  reportCreateSchema,
  reportStatusUpdateSchema,
} from '../schemas/reportSchema.js';

/**
 * GET /api/reports
 * Lista todos os reports. Só admin.
 */
export const getReportsController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  if (req.utilizador.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  try {
    const reports = await reportService.getReports();
    return res.json(reports);
  } catch (error) {
    console.error('Erro ao listar reports:', error);
    return res.status(500).json({ error: 'Erro ao listar reports' });
  }
};

/**
 * GET /api/reports/:id
 * Obtém um report. Admin ou autor do report.
 */
export const getReportByIdController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = reportIdParamSchema.safeParse(req.params);

  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const report = await reportService.getReportById(paramResult.data.id);

    if (!report) {
      return res.status(404).json({ error: 'Report não encontrado' });
    }

    const isOwner = report.id_reportado_por === req.utilizador.id_utilizador;
    const isAdmin = req.utilizador.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    return res.json(report);
  } catch (error) {
    console.error('Erro ao obter report:', error);
    return res.status(500).json({ error: 'Erro ao obter report' });
  }
};

/**
 * POST /api/reports
 * Cria um novo report.
 */
export const createReportController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const bodyResult = reportCreateSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const newReport = await reportService.createReport(
      req.utilizador.id_utilizador,
      bodyResult.data.id_reportado,
      bodyResult.data.id_tarefa,
      bodyResult.data.tipo,
      bodyResult.data.status,
      bodyResult.data.relevancia
    );

    return res.status(201).json(newReport);
  } catch (error) {
    console.error('Erro ao criar report:', error);
    return res.status(400).json({ error: 'Dados inválidos' });
  }
};

/**
 * PUT /api/reports/:id/status
 * Atualiza o status de um report. Só admin.
 */
export const updateReportStatusController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  if (req.utilizador.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  const paramResult = reportIdParamSchema.safeParse(req.params);

  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  const bodyResult = reportStatusUpdateSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const updatedReport = await reportService.updateReportStatus(
      paramResult.data.id,
      bodyResult.data.status
    );

    return res.json(updatedReport);
  } catch (error) {
    console.error('Erro ao atualizar status do report:', error);
    return res.status(404).json({ error: 'Report não encontrado ou dados inválidos' });
  }
};

/**
 * DELETE /api/reports/:id
 * Remove um report. Admin ou autor.
 */
export const deleteReportController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = reportIdParamSchema.safeParse(req.params);

  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const report = await reportService.getReportById(paramResult.data.id);

    if (!report) {
      return res.status(404).json({ error: 'Report não encontrado' });
    }

    const isOwner = report.id_reportado_por === req.utilizador.id_utilizador;
    const isAdmin = req.utilizador.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    await reportService.deleteReport(paramResult.data.id);
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover report:', error);
    return res.status(404).json({ error: 'Report não encontrado' });
  }
};


/*
 * PATCH /api/reports/:id/resolve
 * Atualiza parcialmente um report, alterando apenas o seu estado para "RESOLVIDO"
 * Marca um report como resolvido. Só admin.
*/
export const resolveReportController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) return res.status(401).json({ error: 'Não autenticado' });
  if (req.utilizador.role !== 'ADMIN') return res.status(403).json({ error: 'Não autorizado' });

  const param = reportIdParamSchema.safeParse(req.params);
  if (!param.success) return res.status(400).json({ error: 'ID inválido' });

  const report = await reportService.updateReportStatus(param.data.id, 'RESOLVIDO');
  return res.json(report);
};


/**
 * PATCH /api/reports/:id/suspend
 * Suspende o utilizador reportado e marca o report como resolvido. Só admin.
*/
export const suspendUserFromReportController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  if (req.utilizador.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Não autorizado' });
  }

  try {
    const id = Number(req.params.id);
    const result = await reportService.suspendReportedUser(id);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Erro ao suspender utilizador' });
  }
};

/**
 * DELETE /api/reports/:id/task
 * Elimina a tarefa associada a um report. Só admin.
 * O report mantém-se mas sem ligação à tarefa.
*/
export const deleteTaskFromReportController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) return res.status(401).json({ error: 'Não autenticado' });
  if (req.utilizador.role !== 'ADMIN') return res.status(403).json({ error: 'Não autorizado' });

  const param = reportIdParamSchema.safeParse(req.params);
  if (!param.success) return res.status(400).json({ error: 'ID inválido' });

  try {
    const result = await reportService.deleteReportedTask(param.data.id);
    return res.json(result);
  } catch {
    return res.status(400).json({ error: 'Erro ao eliminar tarefa' });
  }
};