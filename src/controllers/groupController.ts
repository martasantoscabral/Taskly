import { type Request, type Response } from 'express';
import * as groupService from '../services/groupService.js';
import {groupCreateSchema, groupUserCreateSchema, groupDeleteSchema,} from '../schemas/groupSchema.js';


export const createGroupController = async (req: Request, res: Response) => {
  const result = groupCreateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }

  try {
    const createGroup = await groupService.createGroup(result.data.nome);
    return res.status(201).json(createGroup);
  } catch (error) {
    return res.status(400).json({ error: "Erro ao criar grupo" });
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



