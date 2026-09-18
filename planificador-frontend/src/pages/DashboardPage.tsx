import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { PlanningCalendar } from '@/components/calendar/PlanningCalendar';
import { useFiltersStore } from '@/store/filters.store';
import { useAuthStore } from '@/store/auth.store';
import { reportesApi } from '@/api/reportes.api';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeClaseId } = useFiltersStore();

  const canSeeAlerts = user?.rol === 'MAESTRA' || user?.rol === 'DIRECTORA';

  const { data: alertas } = useQuery({
    queryKey: ['alertas', activeClaseId],
    queryFn: () => reportesApi.getAlertas(activeClaseId ?? undefined).then((r) => r.data),
    enabled: !!activeClaseId && canSeeAlerts,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 flex-shrink-0">
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-blue-900">Portfolio snapshot</p>
          <p className="text-xs text-blue-700 mt-1">
            This public UI keeps the calendar/reporting flows intentionally lightweight.
            The backend contains the full authorization and planning domain logic.
          </p>
        </div>
      </div>

      {(alertas ?? []).length > 0 && (
        <div className="px-4 pt-3 space-y-1.5 flex-shrink-0">
          {alertas!.slice(0, 4).map((alerta) => (
            <div
              key={`${alerta.claseId}-${alerta.espacioNombre}`}
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm"
            >
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span className="text-amber-800">{alerta.mensaje}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 px-4 py-4 min-h-0">
        <PlanningCalendar
          onDateClick={() => undefined}
          onEventClick={(planificacion) => navigate(`/planificaciones/${planificacion.id}`)}
        />
      </div>
    </div>
  );
}
