import { z } from 'zod';

export const challengeIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive('O id do desafio deve ser um inteiro positivo'),
});

export const challengeCreateSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  data_inicio: z.string().datetime('data_inicio inválida'),
  data_fim: z.string().datetime('data_fim inválida'),
  badge: z.string().min(2, 'A badge deve ter pelo menos 2 caracteres'),
  notificar: z.boolean(),
  publicado: z.boolean().optional(),
  concluido: z.boolean().optional(),
});

export const challengeUpdateSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres').optional(),
  data_inicio: z.string().datetime('data_inicio inválida').optional(),
  data_fim: z.string().datetime('data_fim inválida').optional(),
  badge: z.string().min(2, 'A badge deve ter pelo menos 2 caracteres').optional(),
  notificar: z.boolean().optional(),
  publicado: z.boolean().optional(),
  concluido: z.boolean().optional(),
});

export const challengeParticipationSchema = z.object({});

export const challengeProgressSchema = z.object({
  concluido: z.boolean(),
});