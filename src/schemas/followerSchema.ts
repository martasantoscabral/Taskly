import { z } from 'zod';

export const followerUserIdParamSchema = z.object({
  id: z.coerce.number().int().positive('O id do utilizador deve ser positivo'),
});

export const followerActionSchema = z.object({
  seguidor_id: z.coerce.number().int().positive('seguidor_id deve ser positivo'),
  seguido_id: z.coerce.number().int().positive('seguido_id deve ser positivo'),
});