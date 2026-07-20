import { z } from 'zod';

export const mergeTaskIdParamSchema = z.object({
  id: z.coerce.number().int().positive('O id da tarefa deve ser um inteiro positivo'),
});

export const mergeIdParamSchema = z.object({
  id: z.coerce.number().int().positive('O id do merge deve ser um inteiro positivo'),
});

export const mergeCreateSchema = z.object({
  tamanho: z.string().min(1, 'O tamanho é obrigatório'),
  ficheiros_incluidos: z.string().min(1, 'Os ficheiros incluídos são obrigatórios'),
});