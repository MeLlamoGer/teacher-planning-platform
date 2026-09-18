import { useEffect, type ReactNode } from 'react';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const {
    initialized,
    setAccessToken,
    setUser,
    markInitialized,
  } = useAuthStore();

  useEffect(() => {
    if (initialized) return;

    let cancelled = false;

    async function restoreSession() {
      try {
        const refresh = await authApi.refresh();
        if (cancelled) return;

        setAccessToken(refresh.data.accessToken);

        const me = await authApi.me();
        if (!cancelled) setUser(me.data);
      } catch {
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) markInitialized();
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [initialized, markInitialized, setAccessToken, setUser]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">
        Restaurando sesión...
      </div>
    );
  }

  return <>{children}</>;
}
