import { prisma } from '../../lib/prisma';
import { storageService } from '../../lib/storage';
import { Rol } from '@prisma/client';

async function assertClassAccess(userId: string, rol: Rol, claseId: string) {
  if (rol === 'DIRECTORA' || rol === 'SECRETARIA') return;

  if (rol === 'MAESTRA') {
    const asignacion = await prisma.usuarioClase.findUnique({
      where: { usuarioId_claseId: { usuarioId: userId, claseId } },
    });
    if (asignacion) return;
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
    if (acceso) return;
  }

  throw new Error('Acceso denegado');
}

async function getArchivoConPlanificacion(id: string) {
  const archivo = await prisma.archivoAdjunto.findUnique({
    where: { id },
    include: { planificacion: { select: { claseId: true } } },
  });
  if (!archivo) throw new Error('Archivo no encontrado');
  return archivo;
}

export async function upload(
  planificacionId: string,
  file: Express.Multer.File,
  userId: string,
  rol: Rol
) {
  const planificacion = await prisma.planificacion.findUnique({
    where: { id: planificacionId },
    select: { claseId: true },
  });
  if (!planificacion) throw new Error('Planificación no encontrada');

  await assertClassAccess(userId, rol, planificacion.claseId);

  const stored = await storageService.save(file);
  return prisma.archivoAdjunto.create({
    data: {
      planificacionId,
      nombreOriginal: stored.nombreOriginal,
      rutaAlmacenada: stored.rutaAlmacenada,
      mimeType: stored.mimeType,
      tamanoBytes: stored.tamanoBytes,
    },
  });
}

export async function download(id: string, userId: string, rol: Rol) {
  const archivo = await getArchivoConPlanificacion(id);
  await assertClassAccess(userId, rol, archivo.planificacion.claseId);
  return {
    archivo,
    absolutePath: storageService.getAbsolutePath(archivo.rutaAlmacenada),
  };
}

export async function remove(id: string, userId: string, rol: Rol) {
  const archivo = await getArchivoConPlanificacion(id);
  await assertClassAccess(userId, rol, archivo.planificacion.claseId);

  await storageService.delete(archivo.rutaAlmacenada);
  await prisma.archivoAdjunto.delete({ where: { id } });
}
