import api from '@/lib/axios';
import type { AnoLectivo } from '@/types';

export const anosLectivosApi = {
  getAll: () => api.get<AnoLectivo[]>('/anos-lectivos'),
  create: (anio: number) => api.post<AnoLectivo>('/anos-lectivos', { anio }),
  update: (id: string, activo: boolean) => api.put<AnoLectivo>(`/anos-lectivos/${id}`, { activo }),
};
