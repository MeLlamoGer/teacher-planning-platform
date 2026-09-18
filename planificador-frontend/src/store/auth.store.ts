import { create } from 'zustand';
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
  initialized: boolean;
  setSession: (token: string, user: AuthUser) => void;
  setAccessToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  markInitialized: () => void;
  logout: () => void;
}

/**
 * Access tokens intentionally live only in memory.
 *
 * A page reload rehydrates the session through the HTTP-only refresh cookie
 * instead of persisting a bearer token in local/session storage.
 */
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  initialized: false,
  setSession: (token, user) => set({ accessToken: token, user, initialized: true }),
  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  markInitialized: () => set({ initialized: true }),
  logout: () => set({ user: null, accessToken: null, initialized: true }),
}));
