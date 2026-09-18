import api from '@/lib/axios';
import type { Planificacion, Comentario } from '@/types';

export interface PlanificacionFilters {
  claseId?: string;
  fecha?: string;
  fechaInicio?: string;
  fechaFin?: string;
  espacioId?: string;
  unidadId?: string;
  anoLectivoId?: string;
}

export interface CreatePlanificacionData {
  titulo?: string;
  descripcion: string;
  metasAprendizaje?: string;
  fecha: string;
  claseId: string;
  espacioCurricularId: string;
  unidadCurricularIds: string[];
  competenciaEspecificaIds: string[];
  contenidoItemIds: string[];
}

export const planificacionesApi = {
  getAll: (filters: PlanificacionFilters) =>
    api.get<Planificacion[]>('/planificaciones', { params: filters }),
  getById: (id: string) => api.get<Planificacion>(`/planificaciones/${id}`),
  create: (data: CreatePlanificacionData) => api.post<Planificacion>('/planificaciones', data),
  bulkCreate: (templateData: Omit<CreatePlanificacionData, 'fecha'>, fechas: string[]) =>
    api.post<Planificacion[]>('/planificaciones/bulk', { templateData, fechas }),
  update: (id: string, data: Partial<CreatePlanificacionData>) =>
    api.put<Planificacion>(`/planificaciones/${id}`, data),
  delete: (id: string) => api.delete(`/planificaciones/${id}`),
  uploadArchivo: (planificacionId: string, file: File) => {
    const formData = new FormData();
    formData.append('archivo', file);
    return api.post(`/planificaciones/${planificacionId}/archivos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteArchivo: (archivoId: string) => api.delete(`/archivos/${archivoId}`),
  getComentarios: (planificacionId: string) =>
    api.get<Comentario[]>(`/planificaciones/${planificacionId}/comentarios`),
  createComentario: (planificacionId: string, texto: string) =>
    api.post<Comentario>(`/planificaciones/${planificacionId}/comentarios`, { texto }),
  getAdaptaciones: (planificacionId: string) =>
    api.get(`/planificaciones/${planificacionId}/adaptaciones`),
  createAdaptacion: (planificacionId: string, data: { descripcion: string; estudianteIds: string[] }) =>
    api.post(`/planificaciones/${planificacionId}/adaptaciones`, data),
  deleteAdaptacion: (adaptacionId: string) => api.delete(`/adaptaciones/${adaptacionId}`),
};
