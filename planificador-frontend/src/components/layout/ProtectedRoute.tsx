import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import type { Rol } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Rol[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, accessToken } = useAuthStore();

  if (!user || !accessToken) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.rol)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
