import api from '@/lib/axios';
import type { Estudiante, DificultadApoyo } from '@/types';

export const estudiantesApi = {
  getByClase: (claseId: string, anoLectivoId?: string) =>
    api.get<Estudiante[]>(`/clases/${claseId}/estudiantes`, {
      params: anoLectivoId ? { anoLectivoId } : {},
    }),
  create: (claseId: string, data: { nombre: string; anoLectivoId: string }) =>
    api.post<Estudiante>(`/clases/${claseId}/estudiantes`, data),
  update: (claseId: string, estudianteId: string, data: { nombre?: string; activo?: boolean }) =>
    api.put<Estudiante>(`/clases/${claseId}/estudiantes/${estudianteId}`, data),
  getDificultades: (estudianteId: string) =>
    api.get<DificultadApoyo[]>(`/estudiantes/${estudianteId}/dificultades`),
  createDificultad: (
    estudianteId: string,
    data: { observacion: string; espacioCurricularId?: string; unidadCurricularId?: string }
  ) => api.post<DificultadApoyo>(`/estudiantes/${estudianteId}/dificultades`, data),
  deleteDificultad: (dificultadId: string) => api.delete(`/dificultades/${dificultadId}`),
  getDificultadesByClase: (claseId: string, espacioCurricularId?: string) =>
    api.get<DificultadApoyo[]>(`/clases/${claseId}/dificultades`, {
      params: espacioCurricularId ? { espacioCurricularId } : {},
    }),
};
