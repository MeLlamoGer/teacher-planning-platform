import api from '@/lib/axios';
import type { Clase } from '@/types';

export const clasesApi = {
  getAll: (anoLectivoId?: string) =>
    api.get<Clase[]>('/clases', { params: anoLectivoId ? { anoLectivoId } : {} }),
  getById: (id: string) => api.get<Clase>(`/clases/${id}`),
  create: (data: { nombre: string; nivel: string; seccion: string; tramo: string; anoLectivoId: string }) =>
    api.post<Clase>('/clases', data),
  update: (id: string, data: Partial<{ nombre: string; nivel: string; seccion: string; tramo: string }>) =>
    api.put<Clase>(`/clases/${id}`, data),
  asignarUsuario: (claseId: string, usuarioId: string) =>
    api.post(`/clases/${claseId}/usuarios`, { usuarioId }),
  desasignarUsuario: (claseId: string, usuarioId: string) =>
    api.delete(`/clases/${claseId}/usuarios/${usuarioId}`),
};
