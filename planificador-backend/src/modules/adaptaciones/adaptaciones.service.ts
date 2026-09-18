import { prisma } from '../../lib/prisma';

const INCLUDE = {
  estudiantes: { include: { estudiante: { select: { id: true, nombre: true } } } },
};

export async function getByPlanificacion(planificacionId: string) {
  return prisma.adaptacion.findMany({
    where: { planificacionId },
    include: INCLUDE,
    orderBy: { createdAt: 'asc' },
  });
}

export async function create(
  planificacionId: string,
  data: { descripcion: string; estudianteIds: string[] }
) {
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

export async function update(id: string, data: { descripcion?: string; estudianteIds?: string[] }) {
  const adaptacion = await prisma.adaptacion.findUnique({ where: { id } });
  if (!adaptacion) throw new Error('Adaptación no encontrada');

  return prisma.$transaction(async (tx) => {
    if (data.estudianteIds !== undefined) {
      await tx.adaptacionEstudiante.deleteMany({ where: { adaptacionId: id } });
    }
    return tx.adaptacion.update({
      where: { id },
      data: {
        ...(data.descripcion && { descripcion: data.descripcion }),
        ...(data.estudianteIds !== undefined && {
          estudiantes: {
            create: data.estudianteIds.map((eid) => ({ estudianteId: eid })),
          },
        }),
      },
      include: INCLUDE,
    });
  });
}

export async function remove(id: string) {
  const adaptacion = await prisma.adaptacion.findUnique({ where: { id } });
  if (!adaptacion) throw new Error('Adaptación no encontrada');
  await prisma.adaptacion.delete({ where: { id } });
}
