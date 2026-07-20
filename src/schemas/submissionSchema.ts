import { z } from 'zod';

export const submissionTaskIdParamSchema = z.object({
  id: z.coerce.number().int().positive('O id da tarefa deve ser um inteiro positivo'),
});

export const submissionIdsParamSchema = z.object({
  id: z.coerce.number().int().positive('O id da tarefa deve ser um inteiro positivo'),
  submissionId: z.coerce
    .number()
    .int()
    .positive('O id da submissão deve ser um inteiro positivo'),
});

export const submissionCreateSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  nome_ficheiro: z.string().min(1, 'O nome do ficheiro é obrigatório'),
  file_path: z.string().min(1, 'O caminho do ficheiro é obrigatório'),
  mensagem_commit: z.string().optional(),
});