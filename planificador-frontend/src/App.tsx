import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PlanificacionPage } from '@/pages/PlanificacionPage';
import { EstudiantesPage } from '@/pages/EstudiantesPage';
import { ReportesPage } from '@/pages/ReportesPage';
import { UsuariosPage } from '@/pages/admin/UsuariosPage';
import { ClasesPage } from '@/pages/admin/ClasesPage';
import { SuplenciasPage } from '@/pages/admin/SuplenciasPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/planificaciones/:id" element={<PlanificacionPage />} />
        <Route path="/estudiantes" element={<EstudiantesPage />} />
        <Route path="/clases/:id/estudiantes" element={<EstudiantesPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={['DIRECTORA', 'SECRETARIA']}><UsuariosPage /></ProtectedRoute>} />
        <Route path="/admin/clases" element={<ProtectedRoute allowedRoles={['DIRECTORA']}><ClasesPage /></ProtectedRoute>} />
        <Route path="/admin/suplencias" element={<ProtectedRoute allowedRoles={['DIRECTORA']}><SuplenciasPage /></ProtectedRoute>} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
