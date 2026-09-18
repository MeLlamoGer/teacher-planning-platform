import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Paperclip } from 'lucide-react';
import { planificacionesApi } from '@/api/planificaciones.api';
import { Button } from '@/components/ui/Button';
import { formatDate, formatFileSize } from '@/lib/utils';

export function PlanificacionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: planificacion, isLoading, isError } = useQuery({
    queryKey: ['planificacion', id],
    queryFn: () => planificacionesApi.getById(id!).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 text-gray-500">Cargando...</div>;

  if (isError || !planificacion) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No se pudo cargar la planificación.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al calendario
      </button>

      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-3 h-3 rounded-full"
          style={{ background: planificacion.espacioCurricular.color }}
        />
        <span className="text-sm font-medium text-gray-500">
          {planificacion.espacioCurricular.nombre}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">
        {planificacion.titulo || 'Planificación sin título'}
      </h1>
      <p className="text-sm text-gray-400 mt-1">{formatDate(planificacion.fecha)}</p>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {planificacion.unidades.map((u) => (
          <span
            key={u.unidadCurricular.id}
            className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
          >
            {u.unidadCurricular.nombre}
          </span>
        ))}
      </div>

      <section className="bg-white border border-gray-200 rounded-lg p-5 mt-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Actividad</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {planificacion.descripcion}
        </p>
        {planificacion.metasAprendizaje && (
          <>
            <h2 className="text-sm font-semibold text-gray-700 mt-5 mb-2">Metas de aprendizaje</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{planificacion.metasAprendizaje}</p>
          </>
        )}
      </section>

      <section className="mt-6">
        <div className="flex items-center gap-2 mb-2">
          <Paperclip className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Archivos adjuntos</h2>
        </div>
        {planificacion.archivos.length === 0 ? (
          <p className="text-sm text-gray-400">Sin archivos adjuntos.</p>
        ) : (
          <div className="space-y-2">
            {planificacion.archivos.map((archivo) => (
              <a
                key={archivo.id}
                href={`/api/v1/archivos/${archivo.id}/download`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50"
              >
                <span>
                  <span className="block text-sm text-gray-800">{archivo.nombreOriginal}</span>
                  <span className="block text-xs text-gray-400">{formatFileSize(archivo.tamanoBytes)}</span>
                </span>
                <Download className="h-4 w-4 text-gray-500" />
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
