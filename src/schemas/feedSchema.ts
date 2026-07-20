import { z } from 'zod';

export const feedIdParamSchema = z.object({
  id: z.coerce.number().int().positive('O id da publicação deve ser positivo'),
});

export const feedCommentIdParamSchema = z.object({
  commentId: z.coerce.number().int().positive('O id do comentário deve ser positivo'),
});

export const feedCreateSchema = z.object({
  id_user: z.coerce.number().int().positive('id_user deve ser positivo'),
  id_tarefa: z.coerce.number().int().positive().optional(),
  id_subtask: z.coerce.number().int().positive().optional(),
  id_desafio: z.coerce.number().int().positive().optional(),

  tipo: z.enum([
    'TAREFA_EM_PROGRESSO',
    'TAREFA_CONCLUIDA',
    'SUBTAREFA_CONCLUIDA',
    'TAREFA_PARTILHADA',
    'DESAFIO_CONCLUIDO',
    'BADGE_RECEBIDO',
  ]),

  comentario: z.string().max(500, 'O comentário não pode ter mais de 500 caracteres').optional(),
  quer_participantes: z.boolean().optional(),
  badge: z.string().max(100).optional(),
}).superRefine((data, ctx) => {
  if (
    ['TAREFA_EM_PROGRESSO', 'TAREFA_CONCLUIDA', 'TAREFA_PARTILHADA'].includes(data.tipo) &&
    !data.id_tarefa
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['id_tarefa'],
      message: 'Este tipo de publicação exige id_tarefa',
    });
  }

  if (data.tipo === 'SUBTAREFA_CONCLUIDA' && !data.id_subtask) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['id_subtask'],
      message: 'Este tipo de publicação exige id_subtask',
    });
  }

  if (data.tipo === 'DESAFIO_CONCLUIDO' && !data.id_desafio) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['id_desafio'],
      message: 'Este tipo de publicação exige id_desafio',
    });
  }

  if (data.tipo === 'BADGE_RECEBIDO' && !data.badge) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['badge'],
      message: 'Este tipo de publicação exige badge',
    });
  }
});

export const feedLikeSchema = z.object({
  id_user: z.coerce.number().int().positive('id_user deve ser positivo'),
});

export const feedCommentCreateSchema = z.object({
  id_user: z.coerce.number().int().positive('id_user deve ser positivo'),
  comentario: z
    .string()
    .min(1, 'O comentário é obrigatório')
    .max(300, 'O comentário não pode ter mais de 300 caracteres'),
});