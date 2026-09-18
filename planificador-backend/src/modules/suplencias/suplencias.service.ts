import { prisma } from '../../lib/prisma';

const INCLUDE = {
  usuario: { select: { id: true, nombre: true, email: true, rol: true } },
  clase: { include: { anoLectivo: true } },
  creadoPor: { select: { id: true, nombre: true } },
};

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
  return prisma.accesoTemporalSuplencia.create({
    data: {
      usuarioId: data.usuarioId,
      claseId: data.claseId,
      creadoPorId,
      fechaInicio: new Date(data.fechaInicio),
      fechaFin: new Date(data.fechaFin),
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

  return prisma.accesoTemporalSuplencia.update({
    where: { id },
    data: {
      ...(data.fechaInicio && { fechaInicio: new Date(data.fechaInicio) }),
      ...(data.fechaFin && { fechaFin: new Date(data.fechaFin) }),
      ...(data.motivo !== undefined && { motivo: data.motivo }),
      ...(data.activo !== undefined && { activo: data.activo }),
    },
    include: INCLUDE,
  });
}
