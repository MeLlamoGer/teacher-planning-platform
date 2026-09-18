import { prisma } from '../../lib/prisma';

export async function getByClase(claseId: string, anoLectivoId?: string) {
  return prisma.estudiante.findMany({
    where: {
      claseId,
      ...(anoLectivoId ? { anoLectivoId } : {}),
    },
    include: { dificultades: { include: { espacioCurricular: true, unidadCurricular: true } } },
    orderBy: { nombre: 'asc' },
  });
}

export async function create(claseId: string, data: { nombre: string; anoLectivoId: string }) {
  return prisma.estudiante.create({ data: { ...data, claseId } });
}

export async function update(
  claseId: string,
  id: string,
  data: { nombre?: string; activo?: boolean }
) {
  const estudiante = await prisma.estudiante.findUnique({ where: { id } });
  if (!estudiante || estudiante.claseId !== claseId) {
    throw new Error('Estudiante no encontrado en esta clase');
  }
  return prisma.estudiante.update({ where: { id }, data });
}
