import { z } from 'zod';

export const createEstudianteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  anoLectivoId: z.string().uuid('ID de año lectivo inválido'),
});

export const updateEstudianteSchema = z.object({
  nombre: z.string().min(1).optional(),
  activo: z.boolean().optional(),
});
