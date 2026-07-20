import { number, z } from 'zod';

export const notificationIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive('O id da notificação deve ser um inteiro positivo'),
});



export const notificationCreateSchema = z.object({
  id_user: z.coerce
    .number()
    .int('id_user deve ser um inteiro')
    .positive('id_user deve ser positivo'),

  tipo: z
    .string()
    .min(2, 'O tipo deve ter pelo menos 2 caracteres'),

  mensagem: z
    .string()
    .min(3, 'A mensagem deve ter pelo menos 3 caracteres'),
});

export const notificationGroupCreateSchema = z.object({
  grupo_id: z.coerce
    .number()
    .int('id do grupo deve ser um inteiro')
    .positive('id do grupo deve ser positivo'),

  msg: z
    .string('Uma mensagem é composta por caracteres de escrita!'),

  file: z
    .number()
    .int()
    .positive()
    .or(z.null())
});

export const notificationGroupDeleteSchema = z.object({
  grupo_id: z.coerce
    .number()
    .int()
    .positive(),
  
  
});

export const getAllNotificationGroupSchema = z.object({
  grupo_id: z.coerce
    .number('')
    .int()
    .positive(),
  
  
});