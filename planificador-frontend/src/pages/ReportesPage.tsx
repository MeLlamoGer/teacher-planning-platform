import { useQuery } from '@tanstack/react-query';
import { reportesApi } from '@/api/reportes.api';
import { useFiltersStore } from '@/store/filters.store';
import { EmptyState } from '@/components/shared/EmptyState';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function ReportesPage() {
  const { activeClaseId, activeAnoLectivoId } = useFiltersStore();

  const { data, isLoading } = useQuery({
    queryKey: ['cobertura', activeClaseId, activeAnoLectivoId],
    queryFn: () =>
      reportesApi
        .getCobertura({
          claseId: activeClaseId ?? undefined,
          anoLectivoId: activeAnoLectivoId ?? undefined,
        })
        .then((r) => r.data),
  });

  const porEspacio = (data?.porEspacio ?? [])
    .filter((item) => item.espacio)
    .map((item) => ({
      espacio: item.espacio.nombre,
      color: item.espacio.color,
      count: item.count,
    }));

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Reportes de cobertura</h1>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : porEspacio.length === 0 ? (
        <EmptyState
          title="Sin datos"
          description="No hay planificaciones para los filtros seleccionados."
        />
      ) : (
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Planificaciones por espacio curricular
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={porEspacio} margin={{ left: 0, right: 8, top: 4, bottom: 40 }}>
                <XAxis dataKey="espacio" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {porEspacio.map((entry, i) => (
                    <Cell key={i} fill={entry.color ?? '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Espacio curricular</th>
                  <th className="text-right px-4 py-3">Planificaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {porEspacio.map((row) => (
                  <tr key={row.espacio}>
                    <td className="px-4 py-2.5">{row.espacio}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
