import { z } from 'zod';

export const reportIdParamSchema = z.object({
  id: z.coerce.number().int().positive('O id do report deve ser um inteiro positivo'),
});

export const reportCreateSchema = z.object({
  id_reportado: z.coerce
    .number()
    .int('id_reportado deve ser um inteiro')
    .positive('id_reportado deve ser positivo'),

  id_tarefa: z.coerce
    .number()
    .int()
    .positive()
    .optional(),

  
  tipo: z.string().min(3, 'O tipo deve ter pelo menos 3 caracteres'),

  status: z.string().min(3, 'O status deve ter pelo menos 3 caracteres'),

  relevancia: z.string().min(3, 'A relevância deve ter pelo menos 3 caracteres'),
});

export const reportStatusUpdateSchema = z.object({
  status: z.string().min(3, 'O status deve ter pelo menos 3 caracteres'),
});