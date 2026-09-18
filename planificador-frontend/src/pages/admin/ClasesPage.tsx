import { useQuery } from '@tanstack/react-query';
import { clasesApi } from '@/api/clases.api';
import { useFiltersStore } from '@/store/filters.store';

export function ClasesPage() {
  const { activeAnoLectivoId } = useFiltersStore();
  const { data: clases, isLoading } = useQuery({
    queryKey: ['clases', activeAnoLectivoId],
    queryFn: () => clasesApi.getAll(activeAnoLectivoId ?? undefined).then((r) => r.data),
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold text-gray-900">Clases</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Overview of the class/domain model used by the planning platform.
      </p>

      {isLoading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {(clases ?? []).map((clase) => (
            <article key={clase.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="font-semibold text-gray-900">{clase.nombre}</h2>
              <p className="text-sm text-gray-500 mt-1">{clase.nivel} · Sección {clase.seccion}</p>
              <p className="text-xs text-gray-400 mt-2">{clase.tramo}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
