import { z } from 'zod';

export const createAnoLectivoSchema = z.object({
  anio: z.number().int().min(2020).max(2100),
});

export const updateAnoLectivoSchema = z.object({
  activo: z.boolean(),
});
