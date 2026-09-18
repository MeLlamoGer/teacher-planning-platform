import { Rol } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { assertClassAccess, assertPlanningWriteAccess } from '../../lib/access';

const INCLUDE = {
  estudiantes: { include: { estudiante: { select: { id: true, nombre: true } } } },
};

async function getPlanClass(planificacionId: string) {
  const planificacion = await prisma.planificacion.findUnique({
    where: { id: planificacionId },
    select: { claseId: true },
  });
  if (!planificacion) throw new Error('Planificación no encontrada');
  return planificacion.claseId;
}

async function getAdaptation(id: string) {
  const adaptacion = await prisma.adaptacion.findUnique({
    where: { id },
    include: { planificacion: { select: { claseId: true } } },
  });
  if (!adaptacion) throw new Error('Adaptación no encontrada');
  return adaptacion;
}

export async function getByPlanificacion(planificacionId: string, userId: string, rol: Rol) {
  await assertClassAccess(userId, rol, await getPlanClass(planificacionId));

  return prisma.adaptacion.findMany({
    where: { planificacionId },
    include: INCLUDE,
    orderBy: { createdAt: 'asc' },
  });
}

export async function create(
  planificacionId: string,
  data: { descripcion: string; estudianteIds: string[] },
  userId: string,
  rol: Rol
) {
  const claseId = await getPlanClass(planificacionId);
  await assertPlanningWriteAccess(userId, rol, planificacionId);

  const studentsOutsideClass = await prisma.estudiante.count({
    where: {
      id: { in: data.estudianteIds },
      NOT: { claseId },
    },
  });
  if (studentsOutsideClass > 0) {
    throw new Error('Todos los estudiantes deben pertenecer a la clase de la planificación');
  }

  return prisma.adaptacion.create({
    data: {
      planificacionId,
      descripcion: data.descripcion,
      estudiantes: {
        create: data.estudianteIds.map((id) => ({ estudianteId: id })),
      },
    },
    include: INCLUDE,
  });
}

export async function update(
  id: string,
  data: { descripcion?: string; estudianteIds?: string[] },
  userId: string,
  rol: Rol
) {
  const current = await getAdaptation(id);
  await assertPlanningWriteAccess(userId, rol, current.planificacionId);

  if (data.estudianteIds !== undefined) {
    const studentsOutsideClass = await prisma.estudiante.count({
      where: {
        id: { in: data.estudianteIds },
        NOT: { claseId: current.planificacion.claseId },
      },
    });
    if (studentsOutsideClass > 0) {
      throw new Error('Todos los estudiantes deben pertenecer a la clase de la planificación');
    }
  }

  return prisma.$transaction(async (tx) => {
    if (data.estudianteIds !== undefined) {
      await tx.adaptacionEstudiante.deleteMany({ where: { adaptacionId: id } });
    }
    return tx.adaptacion.update({
      where: { id },
      data: {
        ...(data.descripcion !== undefined ? { descripcion: data.descripcion } : {}),
        ...(data.estudianteIds !== undefined
          ? { estudiantes: { create: data.estudianteIds.map((eid) => ({ estudianteId: eid })) } }
          : {}),
      },
      include: INCLUDE,
    });
  });
}

export async function remove(id: string, userId: string, rol: Rol) {
  const current = await getAdaptation(id);
  await assertPlanningWriteAccess(userId, rol, current.planificacionId);
  await prisma.adaptacion.delete({ where: { id } });
}
