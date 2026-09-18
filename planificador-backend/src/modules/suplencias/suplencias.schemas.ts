import { z } from 'zod';

export const createSuplenciaSchema = z.object({
  usuarioId: z.string().uuid(),
  claseId: z.string().uuid(),
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  motivo: z.string().optional(),
});

export const updateSuplenciaSchema = z.object({
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  motivo: z.string().optional(),
  activo: z.boolean().optional(),
});
