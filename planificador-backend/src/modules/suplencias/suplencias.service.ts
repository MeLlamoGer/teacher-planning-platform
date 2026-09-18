import { prisma } from '../../lib/prisma';

const INCLUDE = {
  usuario: { select: { id: true, nombre: true, email: true, rol: true } },
  clase: { include: { anoLectivo: true } },
  creadoPor: { select: { id: true, nombre: true } },
};

function normalizeDate(date: string | Date) {
  const value = typeof date === 'string' ? new Date(date) : new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function assertDateRange(fechaInicio: Date, fechaFin: Date) {
  if (fechaFin < fechaInicio) {
    throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
  }
}

export async function getAll() {
  return prisma.accesoTemporalSuplencia.findMany({
    include: INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
}

export async function create(
  data: { usuarioId: string; claseId: string; fechaInicio: string; fechaFin: string; motivo?: string },
  creadoPorId: string
) {
  const [usuario, clase] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: data.usuarioId },
      select: { id: true, rol: true, activo: true },
    }),
    prisma.clase.findUnique({
      where: { id: data.claseId },
      select: { id: true },
    }),
  ]);

  if (!usuario || !usuario.activo) throw new Error('Usuario suplente no encontrado o inactivo');
  if (usuario.rol !== 'SUPLENTE') throw new Error('El usuario seleccionado debe tener rol SUPLENTE');
  if (!clase) throw new Error('Clase no encontrada');

  const fechaInicio = normalizeDate(data.fechaInicio);
  const fechaFin = normalizeDate(data.fechaFin);
  assertDateRange(fechaInicio, fechaFin);

  const overlapping = await prisma.accesoTemporalSuplencia.findFirst({
    where: {
      usuarioId: data.usuarioId,
      claseId: data.claseId,
      activo: true,
      fechaInicio: { lte: fechaFin },
      fechaFin: { gte: fechaInicio },
    },
    select: { id: true },
  });

  if (overlapping) {
    throw new Error('Ya existe una suplencia activa superpuesta para este usuario y clase');
  }

  return prisma.accesoTemporalSuplencia.create({
    data: {
      usuarioId: data.usuarioId,
      claseId: data.claseId,
      creadoPorId,
      fechaInicio,
      fechaFin,
      motivo: data.motivo,
    },
    include: INCLUDE,
  });
}

export async function update(
  id: string,
  data: { fechaInicio?: string; fechaFin?: string; motivo?: string; activo?: boolean }
) {
  const suplencia = await prisma.accesoTemporalSuplencia.findUnique({ where: { id } });
  if (!suplencia) throw new Error('Suplencia no encontrada');

  const fechaInicio = data.fechaInicio ? normalizeDate(data.fechaInicio) : suplencia.fechaInicio;
  const fechaFin = data.fechaFin ? normalizeDate(data.fechaFin) : suplencia.fechaFin;
  assertDateRange(fechaInicio, fechaFin);

  if (data.activo !== false) {
    const overlapping = await prisma.accesoTemporalSuplencia.findFirst({
      where: {
        id: { not: id },
        usuarioId: suplencia.usuarioId,
        claseId: suplencia.claseId,
        activo: true,
        fechaInicio: { lte: fechaFin },
        fechaFin: { gte: fechaInicio },
      },
      select: { id: true },
    });

    if (overlapping) {
      throw new Error('La nueva ventana se superpone con otra suplencia activa');
    }
  }

  return prisma.accesoTemporalSuplencia.update({
    where: { id },
    data: {
      fechaInicio,
      fechaFin,
      ...(data.motivo !== undefined && { motivo: data.motivo }),
      ...(data.activo !== undefined && { activo: data.activo }),
    },
    include: INCLUDE,
  });
}
