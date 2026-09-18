import { NavLink } from 'react-router-dom';
import { Calendar, Users, BarChart2, Settings, BookOpen, GraduationCap } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useFiltersStore } from '@/store/filters.store';
import { useQuery } from '@tanstack/react-query';
import { clasesApi } from '@/api/clases.api';
import { anosLectivosApi } from '@/api/anos-lectivos.api';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

export function Sidebar() {
  const { user } = useAuthStore();
  const { activeAnoLectivoId, activeClaseId, setAnoLectivo, setClase } = useFiltersStore();

  const { data: anos } = useQuery({
    queryKey: ['anos-lectivos'],
    queryFn: () => anosLectivosApi.getAll().then((r) => r.data),
  });

  const { data: clases } = useQuery({
    queryKey: ['clases', activeAnoLectivoId],
    queryFn: () => clasesApi.getAll(activeAnoLectivoId ?? undefined).then((r) => r.data),
    enabled: !!user,
  });

  const isDirectora = user?.rol === 'DIRECTORA';
  const isAdmin = user?.rol === 'DIRECTORA' || user?.rol === 'SECRETARIA';

  const navItems = [
    { to: '/dashboard', icon: Calendar, label: 'Calendario' },
    { to: '/estudiantes', icon: GraduationCap, label: 'Estudiantes' },
    { to: '/reportes', icon: BarChart2, label: 'Reportes' },
    ...(isAdmin ? [{ to: '/admin/usuarios', icon: Users, label: 'Usuarios' }] : []),
    ...(isDirectora ? [
      { to: '/admin/clases', icon: BookOpen, label: 'Clases' },
      { to: '/admin/suplencias', icon: Settings, label: 'Suplencias' },
    ] : []),
  ];

  return (
    <aside className="w-56 bg-gray-900 text-white flex flex-col h-screen flex-shrink-0">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-sm font-bold text-white leading-tight">Planificador Docente</h1>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{user?.nombre}</p>
        <span className="inline-block mt-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{user?.rol}</span>
      </div>
      <div className="p-3 border-b border-gray-700 space-y-2">
        <div>
          <p className="text-xs text-gray-400 mb-1">Año lectivo</p>
          <Select value={activeAnoLectivoId ?? ''} onValueChange={setAnoLectivo}>
            <SelectTrigger className="h-7 text-xs bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Seleccioná..." />
            </SelectTrigger>
            <SelectContent>
              {anos?.map((a) => <SelectItem key={a.id} value={a.id}>{a.anio}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Clase</p>
          <Select value={activeClaseId ?? '__all__'} onValueChange={(v) => setClase(v === '__all__' ? null : v)}>
            <SelectTrigger className="h-7 text-xs bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Todas las clases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {clases?.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
              isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
