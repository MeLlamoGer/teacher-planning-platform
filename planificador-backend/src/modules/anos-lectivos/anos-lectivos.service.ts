import { prisma } from '../../lib/prisma';

export async function getAll() {
  return prisma.anoLectivo.findMany({ orderBy: { anio: 'desc' } });
}

export async function create(anio: number) {
  const existe = await prisma.anoLectivo.findUnique({ where: { anio } });
  if (existe) throw new Error(`El año lectivo ${anio} ya existe`);
  return prisma.anoLectivo.create({ data: { anio } });
}

export async function update(id: string, activo: boolean) {
  const ano = await prisma.anoLectivo.findUnique({ where: { id } });
  if (!ano) throw new Error('Año lectivo no encontrado');
  return prisma.anoLectivo.update({ where: { id }, data: { activo } });
}
