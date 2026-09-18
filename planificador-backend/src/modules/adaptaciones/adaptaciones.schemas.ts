import { z } from 'zod';

export const createAdaptacionSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida'),
  estudianteIds: z.array(z.string().uuid()).min(1, 'Se requiere al menos un estudiante'),
});

export const updateAdaptacionSchema = z.object({
  descripcion: z.string().min(1).optional(),
  estudianteIds: z.array(z.string().uuid()).optional(),
});
