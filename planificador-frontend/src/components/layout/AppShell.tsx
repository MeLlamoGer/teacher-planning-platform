import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { LogOut } from 'lucide-react';
import { authApi } from '@/api/auth.api';
import { queryClient } from '@/lib/queryClient';

export function AppShell() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      logout();
      queryClient.clear();
      navigate('/login');
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-10 bg-white border-b border-gray-200 flex items-center justify-end px-4 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
