import { Rol } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { assertClassAccess } from '../../lib/access';

const INCLUDE = {
  espacioCurricular: true,
  unidadCurricular: true,
  estudiante: { select: { id: true, nombre: true, claseId: true } },
};

async function getStudent(estudianteId: string) {
  const estudiante = await prisma.estudiante.findUnique({
    where: { id: estudianteId },
    select: { id: true, claseId: true },
  });
  if (!estudiante) throw new Error('Estudiante no encontrado');
  return estudiante;
}

async function getDifficulty(id: string) {
  const dificultad = await prisma.dificultadApoyo.findUnique({
    where: { id },
    include: { estudiante: { select: { claseId: true } } },
  });
  if (!dificultad) throw new Error('Dificultad no encontrada');
  return dificultad;
}

export async function getByEstudiante(estudianteId: string, userId: string, rol: Rol) {
  const estudiante = await getStudent(estudianteId);
  await assertClassAccess(userId, rol, estudiante.claseId);

  return prisma.dificultadApoyo.findMany({
    where: { estudianteId },
    include: INCLUDE,
    orderBy: { createdAt: 'asc' },
  });
}

export async function getByClase(
  claseId: string,
  userId: string,
  rol: Rol,
  espacioCurricularId?: string
) {
  await assertClassAccess(userId, rol, claseId);

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
  data: { observacion: string; espacioCurricularId?: string; unidadCurricularId?: string },
  userId: string,
  rol: Rol
) {
  const estudiante = await getStudent(estudianteId);
  await assertClassAccess(userId, rol, estudiante.claseId);

  return prisma.dificultadApoyo.create({
    data: { estudianteId, ...data },
    include: INCLUDE,
  });
}

export async function update(
  id: string,
  data: { observacion?: string; espacioCurricularId?: string | null; unidadCurricularId?: string | null },
  userId: string,
  rol: Rol
) {
  const dificultad = await getDifficulty(id);
  await assertClassAccess(userId, rol, dificultad.estudiante.claseId);

  return prisma.dificultadApoyo.update({
    where: { id },
    data,
    include: INCLUDE,
  });
}

export async function remove(id: string, userId: string, rol: Rol) {
  const dificultad = await getDifficulty(id);
  await assertClassAccess(userId, rol, dificultad.estudiante.claseId);
  await prisma.dificultadApoyo.delete({ where: { id } });
}
