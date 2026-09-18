import { prisma } from '../../lib/prisma';
import { storageService } from '../../lib/storage';
import { Rol } from '@prisma/client';
import { assertClassAccess } from '../../lib/access';

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
    // Avoid leaving an orphan file behind when the database write fails.
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
  await assertClassAccess(userId, rol, archivo.planificacion.claseId);

  // Delete the database reference first. A failed filesystem cleanup leaves an
  // orphan file rather than a live DB row pointing at a missing attachment.
  await prisma.archivoAdjunto.delete({ where: { id } });
  await storageService.delete(archivo.rutaAlmacenada);
}
