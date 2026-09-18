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
        ? claseIdsPermitidos.includes(claseId)
          ? [claseId]
          : []
        : claseIdsPermitidos;

  const now = new Date();
  const espacios = await prisma.espacioCurricular.findMany({ orderBy: { orden: 'asc' } });
  const clases = await prisma.clase.findMany({
    where: { id: { in: claseIds } },
    select: { id: true, nombre: true },
  });

  const alertas: {
    claseId: string;
    claseNombre?: string;
    espacioNombre: string;
    diasSinPlanificacion: number;
    mensaje: string;
  }[] = [];

  for (const cid of claseIds) {
    const claseNombre = clases.find((c) => c.id === cid)?.nombre;

    for (const espacio of espacios) {
      const ultima = await prisma.planificacion.findFirst({
        where: { claseId: cid, espacioCurricularId: espacio.id },
        orderBy: { fecha: 'desc' },
        select: { fecha: true },
      });

      const diasSinPlanificacion = ultima
        ? Math.max(0, Math.floor((now.getTime() - ultima.fecha.getTime()) / 86_400_000))
        : ALERT_THRESHOLD_DAYS + 1;

      if (!ultima || diasSinPlanificacion >= ALERT_THRESHOLD_DAYS) {
        alertas.push({
          claseId: cid,
          claseNombre,
          espacioNombre: espacio.nombre,
          diasSinPlanificacion,
          mensaje: ultima
            ? `${claseNombre ?? 'Clase'}: Sin planificaciones en "${espacio.nombre}" en los últimos ${diasSinPlanificacion} días`
            : `${claseNombre ?? 'Clase'}: Nunca se planificó "${espacio.nombre}"`,
        });
      }
    }
  }

  return alertas;
}
