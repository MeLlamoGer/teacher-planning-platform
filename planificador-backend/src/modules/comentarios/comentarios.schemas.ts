import { z } from 'zod';

export const createComentarioSchema = z.object({
  texto: z.string().min(1, 'El texto del comentario es requerido'),
});

export const updateComentarioSchema = z.object({
  texto: z.string().min(1),
});
