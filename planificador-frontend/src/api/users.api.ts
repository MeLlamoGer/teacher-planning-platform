import api from '@/lib/axios';
import type { Usuario, Rol } from '@/types';

export const usersApi = {
  getAll: () => api.get<Usuario[]>('/users'),
  create: (data: { nombre: string; email: string; password: string; rol: Rol }) =>
    api.post<Usuario>('/users', data),
  update: (id: string, data: { nombre?: string; email?: string; rol?: Rol; activo?: boolean }) =>
    api.put<Usuario>(`/users/${id}`, data),
  updatePassword: (id: string, password: string) =>
    api.put(`/users/${id}/password`, { password }),
  delete: (id: string) => api.delete(`/users/${id}`),
};
