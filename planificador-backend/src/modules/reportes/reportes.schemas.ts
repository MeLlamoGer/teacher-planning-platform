import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)');

export const coberturaQuerySchema = z.object({
  claseId: z.string().uuid().optional(),
  anoLectivoId: z.string().uuid().optional(),
  fechaInicio: dateString.optional(),
  fechaFin: dateString.optional(),
}).refine(
  (value) => !value.fechaInicio || !value.fechaFin || value.fechaFin >= value.fechaInicio,
  { message: 'fechaFin no puede ser anterior a fechaInicio', path: ['fechaFin'] }
);

export const alertasQuerySchema = z.object({
  claseId: z.string().uuid().optional(),
});
