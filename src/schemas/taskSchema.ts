import { z } from 'zod';

/**
 * Validação do parâmetro :id nas rotas /api/tasks/:id
*/
export const taskIdParamSchema = z.object({
  id: z.coerce.number().int().positive('O id da tarefa deve ser um inteiro positivo'),
});


/**
 * Validação dos filtros da query string em GET /api/tasks
*/
export const taskQuerySchema = z.object({
  id_user: z.coerce.number().int().positive('id_user deve ser um inteiro positivo').optional(),
  id_grupo: z.coerce.number().int().positive().optional(),
  status: z.enum(['PENDING', 'DOING', 'DONE']).optional(),
  priority: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
});



/**
 * Validação para criar uma tarefa
*/
export const taskCreateSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  priority: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
  status: z.enum(['PENDING', 'DOING', 'DONE']).optional(),
  dueDate: z.string().datetime('dueDate inválida').optional(),
  id_user: z.coerce.number().int().positive().optional(),
  id_grupo: z.coerce.number().int().positive().optional(),
  subTasks: z.array(z.object({
    titulo: z.string().min(1, 'O título da subtarefa é obrigatório'),
    concluida: z.boolean().optional(),
    })
  ).optional(),
});
/**
 * Validação para atualizar uma tarefa
 */
export const taskUpdateSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres').optional(),
  description: z.string().optional(),
  priority: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
  status: z.enum(['PENDING', 'DOING', 'DONE']).optional(),
  dueDate: z.string().datetime('dueDate inválida').optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Tem de enviar pelo menos um campo para atualizar.' }
);