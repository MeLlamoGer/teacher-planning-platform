import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Rol } from '@/types';

interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  login: (token: string, user: AuthUser) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      login: (token, user) => set({ accessToken: token, user }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'planificador-auth',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
