import { prisma } from '../../lib/prisma';
import { storageService } from '../../lib/storage';
import { Rol } from '@prisma/client';
import { assertClassAccess, assertPlanningWriteAccess } from '../../lib/access';

async function getArchivoConPlanificacion(id: string) {
  const archivo = await prisma.archivoAdjunto.findUnique({
    where: { id },
    include: {
      planificacion: {
        select: { id: true, claseId: true, autorCreacionId: true },
      },
    },
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
  await assertPlanningWriteAccess(userId, rol, planificacionId);

  const stored = await storageService.save(file);

  try {
    return await prisma.archivoAdjunto.create({
      data: {
        planificacionId,
        nombreOriginal: stored.nombreOriginal,
        rutaAlmacenada: stored.rutaAlmacenada,
        mimeType: stored.mimeType,
        tamanoBytes: stored.tamanoBytes,
      },
    });
  } catch (error) {
    await storageService.delete(stored.rutaAlmacenada);
    throw error;
  }
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
  await assertPlanningWriteAccess(userId, rol, archivo.planificacion.id);

  await prisma.archivoAdjunto.delete({ where: { id } });
  await storageService.delete(archivo.rutaAlmacenada);
}
