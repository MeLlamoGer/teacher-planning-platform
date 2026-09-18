import { z } from 'zod';
import { Tramo } from '@prisma/client';

export const createClaseSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  nivel: z.string().min(1, 'El nivel es requerido'),
  seccion: z.string().min(1, 'La sección es requerida'),
  tramo: z.nativeEnum(Tramo),
  anoLectivoId: z.string().uuid('ID de año lectivo inválido'),
});

export const updateClaseSchema = createClaseSchema.partial();

export const asignarUsuarioSchema = z.object({
  usuarioId: z.string().uuid('ID de usuario inválido'),
});
