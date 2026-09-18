import api from '@/lib/axios';
import type { Suplencia } from '@/types';

export const suplenciasApi = {
  getAll: () => api.get<Suplencia[]>('/suplencias'),
  create: (data: {
    usuarioId: string;
    claseId: string;
    fechaInicio: string;
    fechaFin: string;
    motivo?: string;
  }) => api.post<Suplencia>('/suplencias', data),
  update: (id: string, data: { fechaInicio?: string; fechaFin?: string; motivo?: string; activo?: boolean }) =>
    api.put<Suplencia>(`/suplencias/${id}`, data),
};
