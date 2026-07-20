import { type Request, type Response } from 'express';
import * as challengeService from '../services/challengeService.js';
import { type AuthenticatedRequest } from '../middlewares/authGuard.js';
import {
  challengeIdParamSchema,
  challengeCreateSchema,
  challengeUpdateSchema,
  challengeParticipationSchema,
  challengeProgressSchema,
} from '../schemas/challengeSchema.js';

/* 
 * GET /api/challenges  
 * Listar todos os desafios existentes
 */
export const getChallengesController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  try {
    const challenges = await challengeService.getChallenges();
    return res.json(challenges);
  } catch (error) {
    console.error('Erro ao listar desafios:', error);
    return res.status(500).json({ error: 'Erro ao listar desafios' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * GET /api/challenges/:id  
 * Obter um desafio específico pelo ID
 */
export const getChallengeByIdController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = challengeIdParamSchema.safeParse(req.params);

  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const challenge = await challengeService.getChallengeById(paramResult.data.id);

    if (!challenge) {
      return res.status(404).json({ error: 'Desafio não encontrado' });
    }

    return res.json(challenge);
  } catch (error) {
    console.error('Erro ao obter desafio:', error);
    return res.status(500).json({ error: 'Erro ao obter desafio' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * POST /api/challenges  
 * Criar um novo desafio
 */
export const createChallengeController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const bodyResult = challengeCreateSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const newChallenge = await challengeService.createChallenge(
      req.utilizador.id_utilizador,
      bodyResult.data.titulo,
      new Date(bodyResult.data.data_inicio),
      new Date(bodyResult.data.data_fim),
      bodyResult.data.badge,
      bodyResult.data.notificar,
      bodyResult.data.publicado ?? false,
      bodyResult.data.concluido ?? false
    );
    return res.status(201).json(newChallenge);
  } catch (error) {
    console.error('Erro ao criar desafio:', error);
    return res.status(400).json({ error: 'Dados inválidos' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * PUT /api/challenges/:id  
 * Atualizar um desafio existente
 */
export const updateChallengeController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = challengeIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  const bodyResult = challengeUpdateSchema.safeParse(req.body);
  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const challenge = await challengeService.getChallengeById(paramResult.data.id);
    if (!challenge) {
      return res.status(404).json({ error: 'Desafio não encontrado' });
    }

    const isOwner = challenge.id_admin === req.utilizador.id_utilizador;
    const isAdmin = req.utilizador.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    const updatedChallenge = await challengeService.updateChallenge(paramResult.data.id, {
      titulo: bodyResult.data.titulo,
      data_inicio: bodyResult.data.data_inicio
        ? new Date(bodyResult.data.data_inicio)
        : undefined,
      data_fim: bodyResult.data.data_fim
        ? new Date(bodyResult.data.data_fim)
        : undefined,
      badge: bodyResult.data.badge,
      notificar: bodyResult.data.notificar,
    });

    return res.json(updatedChallenge);
  } catch (error) {
    console.error('Erro ao atualizar desafio:', error);
    return res.status(404).json({ error: 'Desafio não encontrado ou dados inválidos' });
  }
};



/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * DELETE /api/challenges/:id  
 * Elimina um desafio
 */
export const deleteChallengeController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = challengeIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const challenge = await challengeService.getChallengeById(paramResult.data.id);
    if (!challenge) {
      return res.status(404).json({ error: 'Desafio não encontrado' });
    }

    const isOwner = challenge.id_admin === req.utilizador.id_utilizador;
    const isAdmin = req.utilizador.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    await challengeService.deleteChallenge(paramResult.data.id);
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao eliminar desafio:', error);
    return res.status(404).json({ error: 'Desafio não encontrado' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * POST /api/challenges/:id/join  
 * Utilizador pode aderir a um desafio
 */
export const joinChallengeController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = challengeIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }


  try {
    const participation = await challengeService.joinChallenge(
      req.utilizador.id_utilizador,
      paramResult.data.id
    );

    return res.status(201).json(participation);
  } catch (error) {
    console.error('Erro ao aderir ao desafio:', error);
    return res.status(400).json({ error: 'Não foi possível aderir ao desafio' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * DELETE /api/challenges/:id/leave  
 * Utilizador pode sair de um desafio
 */
export const leaveChallengeController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = challengeIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }


  try {
    await challengeService.leaveChallenge(
      req.utilizador.id_utilizador,
      paramResult.data.id
    );

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao sair do desafio:', error);
    return res.status(404).json({ error: 'Participação não encontrada' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * GET /api/challenges/:id/participants  
 * Listar todos os participantes de um desafio
 */
export const getChallengeParticipantsController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = challengeIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const participants = await challengeService.getChallengeParticipants(paramResult.data.id);
    return res.json(participants);
  } catch (error) {
    console.error('Erro ao listar participantes:', error);
    return res.status(500).json({ error: 'Erro ao listar participantes' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * PUT /api/challenges/:id/progress  
 * Atualizar progresso de um desafio para um utilizador
 */
export const updateChallengeProgressController = async (req: AuthenticatedRequest,res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const paramResult = challengeIdParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  const bodyResult = challengeProgressSchema.safeParse(req.body);
  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const updatedParticipation = await challengeService.updateChallengeProgress(
      req.utilizador.id_utilizador,
      paramResult.data.id,
      bodyResult.data.concluido
    );

    return res.json(updatedParticipation);
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    return res.status(404).json({ error: 'Participação não encontrada ou dados inválidos' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * PUT /api/challenges/:id/publish  
 * Publicar um desafio (tornar visível para os utilizadores)
 */

export const publishChallengeController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) return res.status(401).json({ error: 'Não autenticado' });
  if (req.utilizador.role !== 'ADMIN') return res.status(403).json({ error: 'Não autorizado' });

  const id = Number(req.params.id);

  try {
    const result = await challengeService.updateChallenge(id, {
      publicado: true,
      concluido: false,
    });

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Erro ao publicar desafio' });
  }
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * 
 * VOLTAR A RASCUNHO
 */
export const unpublishChallengeController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) return res.status(401).json({ error: 'Não autenticado' });
  if (req.utilizador.role !== 'ADMIN') return res.status(403).json({ error: 'Não autorizado' });

  const id = Number(req.params.id);

  try {
    const result = await challengeService.updateChallenge(id, {
      publicado: false,
    });

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Erro ao despublicar desafio' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * 
 * CONCLUIR DESAFIO (forçar fim)
 */
export const completeChallengeController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) return res.status(401).json({ error: 'Não autenticado' });
  if (req.utilizador.role !== 'ADMIN') return res.status(403).json({ error: 'Não autorizado' });

  const id = Number(req.params.id);

  try {
    const result = await challengeService.updateChallenge(id, {
      concluido: true,
    });

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Erro ao concluir desafio' });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * PUT /api/challenges/:id/complete  
 * Concluir um desafio para um participante específico (forçar conclusão)
 */
export const completeParticipantController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) return res.status(401).json({ error: 'Não autenticado' });
  if (req.utilizador.role !== 'ADMIN') return res.status(403).json({ error: 'Não autorizado' });

  const challengeId = Number(req.params.id);
  const userId = Number(req.params.userId);

  try {
    const result = await challengeService.completeParticipant(challengeId, userId);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Erro ao concluir participante' });
  }
};