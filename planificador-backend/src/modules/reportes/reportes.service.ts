import { prisma } from '../../lib/prisma';
import { Rol } from '@prisma/client';
import { ALERT_THRESHOLD_DAYS } from '../../config/constants';

async function getClaseIdsPermitidos(userId: string, rol: Rol): Promise<string[] | null> {
  if (rol === 'DIRECTORA' || rol === 'SECRETARIA') return null;
  if (rol === 'MAESTRA') {
    const asignaciones = await prisma.usuarioClase.findMany({
      where: { usuarioId: userId },
      select: { claseId: true },
    });
    return asignaciones.map((a) => a.claseId);
  }
  return [];
}

export async function getCobertura(
  userId: string,
  rol: Rol,
  filters: { claseId?: string; anoLectivoId?: string; fechaInicio?: string; fechaFin?: string }
) {
  const claseIdsPermitidos = await getClaseIdsPermitidos(userId, rol);

  const classFilter =
    claseIdsPermitidos === null
      ? filters.claseId
        ? { id: filters.claseId }
        : undefined
      : { id: { in: filters.claseId ? [filters.claseId] : claseIdsPermitidos } };

  const clase = {
    ...(classFilter ?? {}),
    ...(filters.anoLectivoId ? { anoLectivoId: filters.anoLectivoId } : {}),
  };

  const fecha = {
    ...(filters.fechaInicio ? { gte: new Date(filters.fechaInicio) } : {}),
    ...(filters.fechaFin ? { lte: new Date(filters.fechaFin) } : {}),
  };

  const planificacionWhere = {
    ...(Object.keys(clase).length ? { clase } : {}),
    ...(Object.keys(fecha).length ? { fecha } : {}),
  };

  const [porEspacio, porUnidad] = await Promise.all([
    prisma.planificacion.groupBy({
      by: ['espacioCurricularId'],
      where: planificacionWhere,
      _count: { id: true },
    }),
    prisma.planificacionUnidadCurricular.groupBy({
      by: ['unidadCurricularId'],
      where: { planificacion: planificacionWhere },
      _count: { id: true },
    }),
  ]);

  const espacios = await prisma.espacioCurricular.findMany({
    where: { id: { in: porEspacio.map((p) => p.espacioCurricularId) } },
  });
  const unidades = await prisma.unidadCurricular.findMany({
    where: { id: { in: porUnidad.map((p) => p.unidadCurricularId) } },
    include: { espacioCurricular: true },
  });

  return {
    porEspacio: porEspacio.map((p) => ({
      espacio: espacios.find((e) => e.id === p.espacioCurricularId),
      count: p._count.id,
    })),
    porUnidad: porUnidad.map((p) => ({
      unidad: unidades.find((u) => u.id === p.unidadCurricularId),
      count: p._count.id,
    })),
  };
}

export async function getAlertas(userId: string, rol: Rol, claseId?: string) {
  const claseIdsPermitidos = await getClaseIdsPermitidos(userId, rol);

  const claseIds =
    claseIdsPermitidos === null
      ? claseId
        ? [claseId]
        : (await prisma.clase.findMany({ select: { id: true } })).map((c) => c.id)
      : claseId
        ? [claseId]
        : claseIdsPermitidos;

  const threshold = new Date();
  threshold.setDate(threshold.getDate() - ALERT_THRESHOLD_DAYS);

  const espacios = await prisma.espacioCurricular.findMany({ orderBy: { orden: 'asc' } });
  const alertas: { claseId: string; espacioNombre: string; mensaje: string }[] = [];

  for (const cid of claseIds) {
    for (const espacio of espacios) {
      const ultima = await prisma.planificacion.findFirst({
        where: { claseId: cid, espacioCurricularId: espacio.id },
        orderBy: { fecha: 'desc' },
        select: { fecha: true },
      });

      if (!ultima || ultima.fecha < threshold) {
        const claseInfo = await prisma.clase.findUnique({ where: { id: cid }, select: { nombre: true } });
        alertas.push({
          claseId: cid,
          espacioNombre: espacio.nombre,
          mensaje: ultima
            ? `${claseInfo?.nombre}: Sin planificaciones en "${espacio.nombre}" en los últimos ${ALERT_THRESHOLD_DAYS} días`
            : `${claseInfo?.nombre}: Nunca se planificó "${espacio.nombre}"`,
        });
      }
    }
  }
  return alertas;
}
