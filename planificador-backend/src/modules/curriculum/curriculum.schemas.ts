import { Tramo } from '@prisma/client';
import { z } from 'zod';

export const unidadesQuerySchema = z.object({
  espacioId: z.string().uuid().optional(),
});

export const competenciasEspecificasQuerySchema = z.object({
  unidadCurricularId: z.string().uuid(),
  tramo: z.nativeEnum(Tramo),
});

export const bloquesContenidoQuerySchema = competenciasEspecificasQuerySchema.extend({
  nivel: z.string().trim().min(1).optional(),
});
