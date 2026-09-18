import { Rol } from '@prisma/client';
import { prisma } from './prisma';
import { todayDateOnlyUtc } from './dateRange';

export async function hasClassAccess(userId: string, rol: Rol, claseId: string): Promise<boolean> {
  if (rol === 'DIRECTORA' || rol === 'SECRETARIA') return true;

  if (rol === 'MAESTRA') {
    const assignment = await prisma.usuarioClase.findUnique({
      where: { usuarioId_claseId: { usuarioId: userId, claseId } },
      select: { id: true },
    });
    return Boolean(assignment);
  }

  if (rol === 'SUPLENTE') {
    const today = todayDateOnlyUtc();

    const temporaryAccess = await prisma.accesoTemporalSuplencia.findFirst({
      where: {
        usuarioId: userId,
        claseId,
        activo: true,
        fechaInicio: { lte: today },
        fechaFin: { gte: today },
      },
      select: { id: true },
    });
    return Boolean(temporaryAccess);
  }

  return false;
}

export async function assertClassAccess(userId: string, rol: Rol, claseId: string): Promise<void> {
  if (!(await hasClassAccess(userId, rol, claseId))) {
    throw new Error('Acceso denegado');
  }
}

export async function assertPlanningWriteAccess(
  userId: string,
  rol: Rol,
  planificacionId: string
): Promise<{ claseId: string; autorCreacionId: string }> {
  const planificacion = await prisma.planificacion.findUnique({
    where: { id: planificacionId },
    select: { claseId: true, autorCreacionId: true },
  });

  if (!planificacion) throw new Error('Planificación no encontrada');

  await assertClassAccess(userId, rol, planificacion.claseId);

  if (rol === 'MAESTRA' && planificacion.autorCreacionId !== userId) {
    throw new Error('Solo la autora de la planificación puede modificarla');
  }

  if (rol !== 'MAESTRA' && rol !== 'DIRECTORA') {
    throw new Error('Acceso denegado');
  }

  return planificacion;
}
