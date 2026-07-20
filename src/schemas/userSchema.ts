import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive('O id deve ser um inteiro positivo'),
});

export const userCreateSchema = z.object({
  nome: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .regex(/^[A-Za-zÀ-ÿ ]+$/, 'O nome só pode conter letras e espaços'),

  email: z
    .string()
    .email('Email inválido'),

  handle: z
    .string()
    .min(3, 'O handle deve ter pelo menos 3 caracteres')
    .regex(/^[A-Za-z0-9._|]+$/, 'O handle só pode conter letras, números, ponto, underscore e barra vertical'),

  password: z
    .string()
    .min(4, 'A password deve ter pelo menos 4 caracteres'),

  role: z.enum(['USER', 'ADMIN']).optional(),
});

export const userUpdateSchema = z.object({
  nome: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .regex(/^[A-Za-zÀ-ÿ ]+$/, 'O nome só pode conter letras e espaços')
    .optional(),

  email: z
    .string()
    .email('Email inválido')
    .optional(),

  handle: z
    .string()
    .min(3, 'O handle deve ter pelo menos 3 caracteres')
    .regex(/^[A-Za-z0-9._|]+$/, 'O handle só pode conter letras, números, ponto, underscore e barra vertical')
    .optional(),

  password: z
    .string()
    .min(4, 'A password deve ter pelo menos 4 caracteres')
    .optional(),

  suspenso: z.boolean().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
});