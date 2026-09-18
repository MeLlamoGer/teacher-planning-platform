import { Rol } from '@prisma/client';
import { prisma } from './prisma';

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
