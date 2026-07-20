import { type Request, type Response } from 'express';
import * as groupService from '../services/groupService.js';
import type { AuthenticatedRequest } from "../middlewares/authGuard.js";
import {groupCreateSchema, groupUserCreateSchema, groupDeleteSchema,} from '../schemas/groupSchema.js';




export const createGroupController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const result = groupCreateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensagem: issue.message,
      })),
    });
  }

  try {
    const utilizadorId = req.utilizador?.id_utilizador;

    if (!utilizadorId) {
      return res.status(401).json({
        error: "Utilizador não autenticado.",
      });
    }

    const resultado = await groupService.createGroupWithLeader(
      result.data.nome,
      utilizadorId,
    );

    return res.status(201).json({
      message: "Grupo criado com sucesso.",
      grupo: resultado.grupo,
      membro: resultado.membro,
    });
  } catch (error) {
    console.error("Erro ao criar grupo:", error);

    return res.status(500).json({
      error: "Erro ao criar grupo.",
    });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */

export const createUserGroupController = async (req: Request, res: Response) => {
  const result = groupUserCreateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }

  try {
    const createGroupUtilizador = await groupService.createGroupUtilizador(
      result.data.gr_id,
      result.data.ut_id,
      result.data.classe
    );

    return res.status(201).json(createGroupUtilizador);
  } catch (error) {
    return res.status(400).json({ error: "Erro ao adicionar utilizador ao grupo" });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */

export const deleteUserGroupController = async (req: Request, res: Response) => {
  const gr_id = Number(req.query.gr_id);
  const ut_id = Number(req.query.ut_id);

  if (!gr_id || !ut_id) {
    return res.status(400).json({ error: "gr_id e ut_id são obrigatórios" });
  }

  try {
    const deleteUtilizadorGrupo = await groupService.deleteUtilizadorGrupo(gr_id, ut_id);
    return res.json(deleteUtilizadorGrupo);
  } catch (error) {
    return res.status(404).json({ error: "Utilizador não está nesse grupo" });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */

export const getGroupsByUserController = async (req: Request, res: Response) => {
  const ut_id = Number(req.query.ut_id);

  if (!ut_id) {
    return res.status(400).json({ error: "ut_id é obrigatório" });
  }

  try {
    const grupos = await groupService.getGroupsByUser(ut_id);
    return res.json(grupos);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar grupos do utilizador" });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */

export const getAllUserInGroupController = async (req: Request, res: Response) => {
  const grupo_id = Number(req.query.grupo_id);

  if (!grupo_id) {
    return res.status(400).json({ error: "grupo_id é obrigatório" });
  }

  try {
    const getAllUserInGroup = await groupService.getAllUserInGroup(grupo_id);
    return res.json(getAllUserInGroup);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar utilizadores do grupo" });
  }
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */

export const deleteGroupController = async (req: Request, res: Response) => {
  const result = groupDeleteSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }

  try {
    const deleteGroup = await groupService.deleteGroup(result.data.grupo_id);
    return res.json(deleteGroup);
  } catch (error) {
    return res.status(404).json({ error: "Grupo não encontrado" });
  }
};



