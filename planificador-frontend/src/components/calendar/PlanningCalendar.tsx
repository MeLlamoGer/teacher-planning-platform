import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { planificacionesApi } from '@/api/planificaciones.api';
import { useFiltersStore } from '@/store/filters.store';
import type { Planificacion } from '@/types';

interface PlanningCalendarProps {
  onDateClick: (date: string) => void;
  onEventClick: (planificacion: Planificacion) => void;
}

export function PlanningCalendar({ onDateClick, onEventClick }: PlanningCalendarProps) {
  const { activeClaseId, activeAnoLectivoId } = useFiltersStore();
  const calendarRef = useRef<FullCalendar>(null);

  const { data: planificaciones, isLoading } = useQuery({
    queryKey: ['planificaciones', activeClaseId, activeAnoLectivoId],
    queryFn: () =>
      planificacionesApi
        .getAll({ claseId: activeClaseId ?? undefined, anoLectivoId: activeAnoLectivoId ?? undefined })
        .then((r) => r.data),
  });

  const events = (planificaciones ?? []).map((p) => ({
    id: p.id,
    title: p.titulo ?? p.espacioCurricular.nombre,
    date: p.fecha.slice(0, 10),
    backgroundColor: p.espacioCurricular.color,
    borderColor: p.espacioCurricular.color,
    textColor: '#ffffff',
    extendedProps: { planificacion: p },
  }));

  return (
    <div className="h-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
          <div className="text-sm text-gray-500">Cargando...</div>
        </div>
      )}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="es"
        firstDay={1}
        height="100%"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
        buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana' }}
        events={events}
        dateClick={(info) => onDateClick(info.dateStr)}
        eventClick={(info) => onEventClick(info.event.extendedProps.planificacion as Planificacion)}
        dayMaxEvents={4}
        moreLinkText={(n) => `+${n} más`}
        eventDisplay="block"
      />
    </div>
  );
}
