import { prisma } from '../../lib/prisma';

const INCLUDE = {
  espacioCurricular: true,
  unidadCurricular: true,
  estudiante: { select: { id: true, nombre: true, claseId: true } },
};

export async function getByEstudiante(estudianteId: string) {
  return prisma.dificultadApoyo.findMany({
    where: { estudianteId },
    include: INCLUDE,
    orderBy: { createdAt: 'asc' },
  });
}

export async function getByClase(claseId: string, espacioCurricularId?: string) {
  return prisma.dificultadApoyo.findMany({
    where: {
      estudiante: { claseId, activo: true },
      ...(espacioCurricularId ? { espacioCurricularId } : {}),
    },
    include: INCLUDE,
    orderBy: { estudiante: { nombre: 'asc' } },
  });
}

export async function create(
  estudianteId: string,
  data: { observacion: string; espacioCurricularId?: string; unidadCurricularId?: string }
) {
  const estudiante = await prisma.estudiante.findUnique({ where: { id: estudianteId } });
  if (!estudiante) throw new Error('Estudiante no encontrado');

  return prisma.dificultadApoyo.create({
    data: { estudianteId, ...data },
    include: INCLUDE,
  });
}

export async function update(
  id: string,
  data: { observacion?: string; espacioCurricularId?: string | null; unidadCurricularId?: string | null }
) {
  const dificultad = await prisma.dificultadApoyo.findUnique({ where: { id } });
  if (!dificultad) throw new Error('Dificultad no encontrada');

  return prisma.dificultadApoyo.update({
    where: { id },
    data,
    include: INCLUDE,
  });
}

export async function remove(id: string) {
  const dificultad = await prisma.dificultadApoyo.findUnique({ where: { id } });
  if (!dificultad) throw new Error('Dificultad no encontrada');
  await prisma.dificultadApoyo.delete({ where: { id } });
}
