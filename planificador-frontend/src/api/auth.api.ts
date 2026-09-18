import api from '@/lib/axios';
import type { Usuario } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; usuario: Usuario }>('/auth/login', { email, password }),
  refresh: () => api.post<{ accessToken: string }>('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<Usuario>('/auth/me'),
};
