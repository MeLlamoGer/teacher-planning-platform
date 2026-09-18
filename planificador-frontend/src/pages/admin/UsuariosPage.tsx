import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';

export function UsuariosPage() {
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usersApi.getAll().then((r) => r.data),
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold text-gray-900">Usuarios</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Public portfolio view. Mutations remain available in the backend API but are omitted from this trimmed UI.
      </p>

      {isLoading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Rol</th>
                <th className="text-left px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(usuarios ?? []).map((usuario) => (
                <tr key={usuario.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{usuario.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{usuario.email}</td>
                  <td className="px-4 py-3 text-gray-600">{usuario.rol}</td>
                  <td className="px-4 py-3 text-gray-600">{usuario.activo ? 'Activo' : 'Inactivo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
