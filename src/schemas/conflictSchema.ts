import { z } from 'zod';

export const conflictIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive('O id do conflito deve ser um inteiro positivo'),
});

export const conflictTaskIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive('O id da tarefa deve ser um inteiro positivo'),
});

export const conflictCreateSchema = z.object({
  id_tarefa: z.coerce
    .number()
    .int('id_tarefa deve ser um inteiro')
    .positive('id_tarefa deve ser positivo'),

  nome_ficheiro: z
    .string()
    .min(1, 'O nome do ficheiro é obrigatório'),

  mensagem_commit: z
    .string()
    .min(1, 'A mensagem de commit é obrigatória'),

  status: z
    .string()
    .min(3, 'O status deve ter pelo menos 3 caracteres'),
});

export const conflictResolveSchema = z.object({
  id_versao_escolhida: z.coerce
    .number()
    .int('id_versao_escolhida deve ser um inteiro')
    .positive('id_versao_escolhida deve ser positivo')
    .nullable()
    .optional(),

  status: z
    .string()
    .min(3, 'O status deve ter pelo menos 3 caracteres'),
});