import { prisma } from '../../lib/prisma';
import { Rol } from '@prisma/client';
import { assertClassAccess } from '../../lib/access';

const INCLUDE_ANO = { anoLectivo: true };

export async function getAll(userId: string, rol: Rol, anoLectivoId?: string) {
  const whereAno = anoLectivoId ? { anoLectivoId } : {};

  if (rol === 'DIRECTORA' || rol === 'SECRETARIA') {
    return prisma.clase.findMany({
      where: whereAno,
      include: INCLUDE_ANO,
      orderBy: [{ anoLectivo: { anio: 'desc' } }, { nombre: 'asc' }],
    });
  }

  if (rol === 'MAESTRA') {
    return prisma.clase.findMany({
      where: { ...whereAno, usuarios: { some: { usuarioId: userId } } },
      include: INCLUDE_ANO,
      orderBy: { nombre: 'asc' },
    });
  }

  if (rol === 'SUPLENTE') {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const accesos = await prisma.accesoTemporalSuplencia.findMany({
      where: {
        usuarioId: userId,
        activo: true,
        fechaInicio: { lte: hoy },
        fechaFin: { gte: hoy },
      },
      select: { claseId: true },
    });
    return prisma.clase.findMany({
      where: { id: { in: accesos.map((a) => a.claseId) }, ...whereAno },
      include: INCLUDE_ANO,
      orderBy: { nombre: 'asc' },
    });
  }

  return [];
}

export async function getById(id: string, userId: string, rol: Rol) {
  await assertClassAccess(userId, rol, id);

  const clase = await prisma.clase.findUnique({
    where: { id },
    include: {
      anoLectivo: true,
      usuarios:
        rol === 'DIRECTORA' || rol === 'SECRETARIA'
          ? { include: { usuario: { select: { id: true, nombre: true, email: true, rol: true } } } }
          : false,
    },
  });
  if (!clase) throw new Error('Clase no encontrada');
  return clase;
}

export async function create(data: {
  nombre: string;
  nivel: string;
  seccion: string;
  tramo: import('@prisma/client').Tramo;
  anoLectivoId: string;
}) {
  return prisma.clase.create({ data, include: INCLUDE_ANO });
}

export async function update(id: string, data: Partial<Parameters<typeof create>[0]>) {
  const clase = await prisma.clase.findUnique({ where: { id } });
  if (!clase) throw new Error('Clase no encontrada');
  return prisma.clase.update({ where: { id }, data, include: INCLUDE_ANO });
}

export async function asignarUsuario(claseId: string, usuarioId: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw new Error('Usuario no encontrado');

  return prisma.usuarioClase.upsert({
    where: { usuarioId_claseId: { usuarioId, claseId } },
    update: {},
    create: { usuarioId, claseId },
  });
}

export async function desasignarUsuario(claseId: string, usuarioId: string) {
  await prisma.usuarioClase.delete({
    where: { usuarioId_claseId: { usuarioId, claseId } },
  });
}
