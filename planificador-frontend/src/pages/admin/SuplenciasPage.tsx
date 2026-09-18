import { useQuery } from '@tanstack/react-query';
import { suplenciasApi } from '@/api/suplencias.api';
import { formatDate } from '@/lib/utils';

export function SuplenciasPage() {
  const { data: suplencias, isLoading } = useQuery({
    queryKey: ['suplencias'],
    queryFn: () => suplenciasApi.getAll().then((r) => r.data),
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold text-gray-900">Suplencias</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Temporary class-access windows are modeled explicitly and enforced by the backend.
      </p>

      {isLoading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : (
        <div className="space-y-3">
          {(suplencias ?? []).map((suplencia) => (
            <article key={suplencia.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-medium text-gray-900">{suplencia.usuario.nombre}</h2>
                  <p className="text-sm text-gray-500">{suplencia.clase.nombre}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${suplencia.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {suplencia.activo ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {formatDate(suplencia.fechaInicio)} → {formatDate(suplencia.fechaFin)}
              </p>
              {suplencia.motivo && <p className="text-sm text-gray-500 mt-1">{suplencia.motivo}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
