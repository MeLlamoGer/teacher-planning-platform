import { z } from 'zod';

export const createDificultadSchema = z.object({
  observacion: z.string().min(1, 'La observación es requerida'),
  espacioCurricularId: z.string().uuid().optional(),
  unidadCurricularId: z.string().uuid().optional(),
});

export const updateDificultadSchema = z.object({
  observacion: z.string().min(1).optional(),
  espacioCurricularId: z.string().uuid().nullable().optional(),
  unidadCurricularId: z.string().uuid().nullable().optional(),
});
