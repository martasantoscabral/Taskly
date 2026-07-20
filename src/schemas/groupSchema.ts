import {z} from 'zod';

export const groupCreateSchema = z.object({
    nome: z.string().min(3, 'é necessário que o nome do grupo tenha pelo menos 3 caracteres')
});

export const groupUserCreateSchema = z.object({
    gr_id: z.number().int().positive(),
    ut_id: z.number().int().positive(),
    classe: z.enum(['MEMBRO', 'LIDER']),
});

export const groupDeleteSchema = z.object({
    grupo_id: z.number().int().positive(),
    
});