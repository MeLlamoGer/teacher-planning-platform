import { Rol } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { assertClassAccess } from '../../lib/access';

const INCLUDE = {
  autor: { select: { id: true, nombre: true } },
};

async function getPlanningAccessContext(planificacionId: string) {
  const planificacion = await prisma.planificacion.findUnique({
    where: { id: planificacionId },
    select: { autorCreacionId: true, claseId: true },
  });
  if (!planificacion) throw new Error('Planificación no encontrada');
  return planificacion;
}

export async function getByPlanificacion(planificacionId: string, userId: string, rol: Rol) {
  if (rol === 'SUPLENTE' || rol === 'SECRETARIA') {
    throw new Error('Acceso denegado');
  }

  const planificacion = await getPlanningAccessContext(planificacionId);
  await assertClassAccess(userId, rol, planificacion.claseId);

  if (rol === 'MAESTRA' && planificacion.autorCreacionId !== userId) {
    throw new Error('Acceso denegado');
  }

  return prisma.comentario.findMany({
    where: { planificacionId },
    include: INCLUDE,
    orderBy: { createdAt: 'asc' },
  });
}

export async function create(planificacionId: string, texto: string, autorId: string) {
  const planificacion = await prisma.planificacion.findUnique({ where: { id: planificacionId } });
  if (!planificacion) throw new Error('Planificación no encontrada');

  return prisma.comentario.create({
    data: { planificacionId, texto, autorId },
    include: INCLUDE,
  });
}

export async function update(id: string, texto: string) {
  const comentario = await prisma.comentario.findUnique({ where: { id } });
  if (!comentario) throw new Error('Comentario no encontrado');
  return prisma.comentario.update({ where: { id }, data: { texto }, include: INCLUDE });
}

export async function remove(id: string) {
  const comentario = await prisma.comentario.findUnique({ where: { id } });
  if (!comentario) throw new Error('Comentario no encontrado');
  await prisma.comentario.delete({ where: { id } });
}
