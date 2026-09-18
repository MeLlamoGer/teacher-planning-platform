import { Tramo } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export async function getEspacios() {
  return prisma.espacioCurricular.findMany({
    orderBy: { orden: 'asc' },
    include: { unidades: { orderBy: { orden: 'asc' } } },
  });
}

export async function getUnidades(espacioCurricularId?: string) {
  return prisma.unidadCurricular.findMany({
    where: espacioCurricularId ? { espacioCurricularId } : undefined,
    orderBy: [{ espacioCurricular: { orden: 'asc' } }, { orden: 'asc' }],
    include: { espacioCurricular: true },
  });
}

export async function getCompetencias() {
  return prisma.competenciaGeneral.findMany({ orderBy: { orden: 'asc' } });
}

export async function getCompetenciasEspecificas(unidadCurricularId: string, tramo: Tramo) {
  return prisma.competenciaEspecifica.findMany({
    where: { unidadCurricularId, tramo },
    orderBy: { codigo: 'asc' },
    include: { bloquesContenido: { include: { bloque: true } } },
  });
}

export async function getBloquesContenido(
  unidadCurricularId: string,
  tramo: Tramo,
  nivel?: string
) {
  return prisma.bloqueContenido.findMany({
    where: {
      unidadCurricularId,
      tramo,
      ...(nivel ? { nivel } : {}),
    },
    include: {
      competencias: { include: { competencia: { select: { id: true, codigo: true } } } },
      items: { orderBy: { orden: 'asc' } },
    },
    orderBy: [{ nivel: 'asc' }, { eje: 'asc' }],
  });
}
