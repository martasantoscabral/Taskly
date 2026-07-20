import { type Request, type Response } from 'express';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as userService from '../services/userService.js';
import { type AuthenticatedRequest } from '../middlewares/authGuard.js';
import {
  userIdParamSchema,
  userCreateSchema,
  userUpdateSchema,
} from '../schemas/userSchema.js';

/**
 * GET /api/users
 * Lista todos os users (só admin).
 */
export const getUsersController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  try {
    const users = await userService.getUsers();
    return res.json(users);
  } catch (error) {
    console.error('Erro ao listar users:', error);
    return res.status(500).json({ error: 'Erro ao listar users' });
  }
};

/**
 * GET /api/users/:id
 * Obtém um user específico pelo ID.
 * O próprio user pode ver o seu perfil; admin pode ver qualquer um.
 */
export const getUserByIdController = async (req: AuthenticatedRequest, res: Response) => {
  const result = userIdParamSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const requestedId = Number(result.data.id);
  const isOwner = req.utilizador.id_utilizador === requestedId;
  const isAdmin = req.utilizador.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      error: 'Acesso negado. Apenas pode consultar o seu próprio perfil.',
    });
  }

  try {
    const user = await userService.getUserById(result.data.id);

    if (!user) {
      return res.status(404).json({ error: 'User não encontrado' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Erro ao obter user:', error);
    return res.status(500).json({ error: 'Erro ao obter user' });
  }
};



/**
 * POST /api/users
 * Cria um novo user.
 */
export const createUserController = async (req: Request, res: Response) => {
  const bodyResult = userCreateSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const { nome, email, handle, password, role } = bodyResult.data;

    const newUser = await userService.createUser(
      nome,
      email,
      handle,
      password,
      role
    );

    return res.status(201).json({
      id_utilizador: newUser.id_utilizador,
      nome: newUser.nome,
      email: newUser.email,
      handle: newUser.handle,
      role: newUser.role,
    });
  } catch (error) {
    console.error('Erro ao criar user:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(400).json({
        error: 'Email ou handle já existe',
      });
    }

    return res.status(400).json({ error: 'Dados inválidos' });
  }
};

/**
 * PUT /api/users/:id
 * Atualiza um user existente.
 * O próprio user pode atualizar o seu perfil.
 * Só admin pode alterar role e suspenso.
 */
export const updateUserController = async (req: AuthenticatedRequest, res: Response) => {
  const idResult = userIdParamSchema.safeParse(req.params);

  if (!idResult.success) {
    return res.status(400).json({
      errors: idResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  const bodyResult = userUpdateSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const requestedId = Number(idResult.data.id);
  const isOwner = req.utilizador.id_utilizador === requestedId;
  const isAdmin = req.utilizador.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  try {
    const dados: {
      nome?: string;
      email?: string;
      handle?: string;
      password?: string;
      suspenso?: boolean;
      role?: 'USER' | 'ADMIN';
    } = { ...bodyResult.data };

    if (!isAdmin) {
      delete dados.role;
      delete dados.suspenso;
    }

    if (dados.password) {
      dados.password = await bcrypt.hash(dados.password, 10);
    }

    const updatedUser = await userService.updateUser(idResult.data.id, dados);
    return res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar user:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(400).json({
        error: 'Email ou handle já existe',
      });
    }

    return res.status(404).json({ error: 'User não encontrado ou dados inválidos' });
  }
};

/**
 * DELETE /api/users/:id
 * Deleta um user pelo ID.
 * O próprio user pode apagar a conta; admin pode apagar qualquer uma.
 */
export const deleteUserController = async (req: AuthenticatedRequest, res: Response) => {
  const result = userIdParamSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const requestedId = Number(result.data.id);
  const isOwner = req.utilizador.id_utilizador === requestedId;
  const isAdmin = req.utilizador.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  try {
    await userService.deleteUser(result.data.id);
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao apagar user:', error);
    return res.status(404).json({ error: 'User não encontrado' });
  }
};