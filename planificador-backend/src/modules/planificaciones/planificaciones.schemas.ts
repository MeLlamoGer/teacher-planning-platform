import { z } from 'zod';

export const createPlanificacionSchema = z.object({
  titulo: z.string().optional(),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  metasAprendizaje: z.string().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  claseId: z.string().uuid('ID de clase inválido'),
  espacioCurricularId: z.string().uuid('ID de espacio curricular inválido'),
  unidadCurricularIds: z.array(z.string().uuid()).min(1, 'Seleccioná al menos una competencia'),
  competenciaEspecificaIds: z.array(z.string().uuid()).min(1, 'Seleccioná al menos una CE'),
  contenidoItemIds: z.array(z.string().uuid()).min(1, 'Seleccioná al menos un contenido'),
});

export const updatePlanificacionSchema = z.object({
  titulo: z.string().optional(),
  descripcion: z.string().min(1).optional(),
  metasAprendizaje: z.string().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  espacioCurricularId: z.string().uuid().optional(),
  unidadCurricularIds: z.array(z.string().uuid()).min(1).optional(),
  competenciaEspecificaIds: z.array(z.string().uuid()).min(1).optional(),
  contenidoItemIds: z.array(z.string().uuid()).min(1).optional(),
});

export const bulkCreateSchema = z.object({
  templateData: z.object({
    titulo: z.string().optional(),
    descripcion: z.string().min(1, 'La descripción es requerida'),
    claseId: z.string().uuid(),
    espacioCurricularId: z.string().uuid(),
    unidadCurricularIds: z.array(z.string().uuid()).min(1),
    competenciaEspecificaIds: z.array(z.string().uuid()).min(1),
    contenidoItemIds: z.array(z.string().uuid()).min(1),
  }),
  fechas: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1),
});

export const querySchema = z.object({
  claseId: z.string().uuid().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  espacioId: z.string().uuid().optional(),
  unidadId: z.string().uuid().optional(),
  anoLectivoId: z.string().uuid().optional(),
});
