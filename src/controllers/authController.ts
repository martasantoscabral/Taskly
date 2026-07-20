import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import * as userService from '../services/userService.js';
import { userCreateSchema } from '../schemas/userSchema.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido nas variáveis de ambiente.');
}

/**
 * POST /api/auth/register
 * Regista um novo utilizador.
 */
export const register = async (req: Request, res: Response) => {
  const bodyResult = userCreateSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const { nome, email, handle, password } = bodyResult.data;

    const newUser = await userService.createUser(nome, email, handle, password);

    return res.status(201).json({
      message: 'Utilizador registado com sucesso.',
      user: {
        id_utilizador: newUser.id_utilizador,
        nome: newUser.nome,
        email: newUser.email,
        handle: newUser.handle,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Erro no registo:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(400).json({
        error: 'Email ou handle já existe.',
      });
    }

    return res.status(500).json({
      error: 'Erro interno no registo.',
    });
  }
};

/**
 * POST /api/auth/login
 * Faz login do utilizador.
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e password são obrigatórios.',
      });
    }

    const user = await userService.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas.',
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password);

    if (!passwordOk) {
      return res.status(401).json({
        error: 'Credenciais inválidas.',
      });
    }

    if (user.suspenso) {
      return res.status(403).json({
        error: 'Conta suspensa.',
      });
    }

    const token = jwt.sign(
      {
        id_utilizador: user.id_utilizador,
        role: user.role ?? 'USER',
      },
      JWT_SECRET,
      { expiresIn: '1h' },
    );

    return res.status(200).json({
      message: 'Login com sucesso.',
      token,
      user: {
        id_utilizador: user.id_utilizador,
        nome: user.nome,
        email: user.email,
        handle: user.handle,
        role: user.role ?? 'USER',
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);

    return res.status(500).json({
      error: 'Erro interno no login.',
    });
  }
};