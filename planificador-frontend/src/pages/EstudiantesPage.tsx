import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '@/api/estudiantes.api';
import { clasesApi } from '@/api/clases.api';
import { useFiltersStore } from '@/store/filters.store';
import { EmptyState } from '@/components/shared/EmptyState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

export function EstudiantesPage() {
  const { activeAnoLectivoId, activeClaseId, setClase } = useFiltersStore();

  const { data: clases } = useQuery({
    queryKey: ['clases', activeAnoLectivoId],
    queryFn: () => clasesApi.getAll(activeAnoLectivoId ?? undefined).then((r) => r.data),
  });

  const { data: estudiantes, isLoading } = useQuery({
    queryKey: ['estudiantes', activeClaseId, activeAnoLectivoId],
    queryFn: () =>
      estudiantesApi
        .getByClase(activeClaseId!, activeAnoLectivoId ?? undefined)
        .then((r) => r.data),
    enabled: !!activeClaseId,
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Estudiantes</h1>
          <p className="text-sm text-gray-500 mt-1">Vista pública de portfolio: lectura y apoyos registrados.</p>
        </div>
        <Select value={activeClaseId ?? ''} onValueChange={setClase}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Seleccioná una clase" />
          </SelectTrigger>
          <SelectContent>
            {(clases ?? []).map((clase) => (
              <SelectItem key={clase.id} value={clase.id}>{clase.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!activeClaseId ? (
        <EmptyState title="Seleccioná una clase" description="Elegí una clase para ver sus estudiantes." />
      ) : isLoading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : (estudiantes ?? []).length === 0 ? (
        <EmptyState title="Sin estudiantes" description="No hay estudiantes activos en la clase seleccionada." />
      ) : (
        <div className="space-y-3">
          {(estudiantes ?? []).filter((e) => e.activo).map((estudiante) => (
            <article key={estudiante.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="font-medium text-gray-900">{estudiante.nombre}</h2>
              {(estudiante.dificultades ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 mt-2">Sin apoyos registrados.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {estudiante.dificultades!.map((dificultad) => (
                    <li key={dificultad.id} className="text-sm bg-amber-50 border border-amber-100 rounded px-3 py-2">
                      <span className="font-medium text-amber-800">
                        {dificultad.espacioCurricular?.nombre ?? 'Apoyo general'}
                      </span>
                      <p className="text-amber-900 mt-1">{dificultad.observacion}</p>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
