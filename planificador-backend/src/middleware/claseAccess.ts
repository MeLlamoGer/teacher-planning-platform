import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

/**
 * Verifica que el usuario autenticado tenga acceso a la clase indicada en :claseId.
 * - DIRECTORA y SECRETARIA: acceso total
 * - MAESTRA: solo clases asignadas
 * - SUPLENTE: solo clase asignada durante la ventana de suplencia activa
 */
export async function claseAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const claseId = req.params.claseId ?? req.body?.claseId;
  if (!claseId) {
    next();
    return;
  }

  const { id: userId, rol } = req.user;
  if (rol === 'DIRECTORA' || rol === 'SECRETARIA') {
    next();
    return;
  }

  if (rol === 'MAESTRA') {
    const asignacion = await prisma.usuarioClase.findUnique({
      where: { usuarioId_claseId: { usuarioId: userId, claseId } },
    });
    if (!asignacion) {
      res.status(403).json({ error: 'No tenés acceso a esta clase' });
      return;
    }
    next();
    return;
  }

  if (rol === 'SUPLENTE') {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const acceso = await prisma.accesoTemporalSuplencia.findFirst({
      where: {
        usuarioId: userId,
        claseId,
        activo: true,
        fechaInicio: { lte: hoy },
        fechaFin: { gte: hoy },
      },
    });
    if (!acceso) {
      res.status(403).json({ error: 'No tenés acceso a esta clase o tu suplencia ha vencido' });
      return;
    }
    next();
    return;
  }

  res.status(403).json({ error: 'Acceso denegado' });
}
