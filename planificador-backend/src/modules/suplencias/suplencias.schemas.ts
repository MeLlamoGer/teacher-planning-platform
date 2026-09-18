import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)');

export const createSuplenciaSchema = z
  .object({
    usuarioId: z.string().uuid(),
    claseId: z.string().uuid(),
    fechaInicio: dateString,
    fechaFin: dateString,
    motivo: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.fechaFin >= data.fechaInicio, {
    message: 'La fecha de fin no puede ser anterior a la fecha de inicio',
    path: ['fechaFin'],
  });

export const updateSuplenciaSchema = z.object({
  fechaInicio: dateString.optional(),
  fechaFin: dateString.optional(),
  motivo: z.string().trim().max(500).optional(),
  activo: z.boolean().optional(),
});
