import { z } from 'zod';

export const subTaskTaskIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const subTaskIdsParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  subtaskId: z.coerce.number().int().positive(),
});

export const subTaskCreateSchema = z.object({
  titulo: z
    .string()
    .min(2, 'O título deve ter pelo menos 2 caracteres'),

  concluida: z
    .boolean()
    .optional(),
});

export const subTaskUpdateSchema = z.object({
  titulo: z
    .string()
    .min(2)
    .optional(),

  concluida: z
    .boolean()
    .optional(),
});