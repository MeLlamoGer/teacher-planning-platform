import { prisma } from '../../lib/prisma';
import { Rol } from '@prisma/client';
import { assertClassAccess as assertSharedClassAccess } from '../../lib/access';

const INCLUDE_FULL = {
  clase: { include: { anoLectivo: true } },
  espacioCurricular: true,
  unidades: { include: { unidadCurricular: true } },
  competenciasEspecificas: { include: { competencia: true } },
  contenidos: { include: { contenidoItem: true } },
  archivos: true,
  autorCreacion: { select: { id: true, nombre: true } },
  autorUltimaEdicion: { select: { id: true, nombre: true } },
};

const INCLUDE_LIST = {
  espacioCurricular: true,
  unidades: { include: { unidadCurricular: true } },
  autorCreacion: { select: { id: true, nombre: true } },
};

function unique(ids: string[]) {
  return [...new Set(ids)];
}

async function getClaseIdsParaUsuario(userId: string, rol: Rol): Promise<string[] | null> {
  if (rol === 'DIRECTORA' || rol === 'SECRETARIA') return null;

  if (rol === 'MAESTRA') {
    const asignaciones = await prisma.usuarioClase.findMany({
      where: { usuarioId: userId },
      select: { claseId: true },
    });
    return asignaciones.map((a) => a.claseId);
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
    return accesos.map((a) => a.claseId);
  }

  return [];
}

async function validateCurriculumSelection(
  claseId: string,
  espacioCurricularId: string,
  unidadCurricularIds: string[],
  competenciaEspecificaIds: string[],
  contenidoItemIds: string[]
) {
  const [clase, espacio] = await Promise.all([
    prisma.clase.findUnique({
      where: { id: claseId },
      select: { id: true, nivel: true, tramo: true },
    }),
    prisma.espacioCurricular.findUnique({
      where: { id: espacioCurricularId },
      select: { id: true },
    }),
  ]);

  if (!clase) throw new Error('Clase no encontrada');
  if (!espacio) throw new Error('Espacio curricular no encontrado');

  const unidades = unique(unidadCurricularIds);
  const competencias = unique(competenciaEspecificaIds);
  const contenidos = unique(contenidoItemIds);

  const [unitCount, competencyCount, contentCount] = await Promise.all([
    prisma.unidadCurricular.count({
      where: {
        id: { in: unidades },
        espacioCurricularId,
      },
    }),
    prisma.competenciaEspecifica.count({
      where: {
        id: { in: competencias },
        unidadCurricularId: { in: unidades },
        tramo: clase.tramo,
      },
    }),
    prisma.contenidoItem.count({
      where: {
        id: { in: contenidos },
        bloque: {
          unidadCurricularId: { in: unidades },
          tramo: clase.tramo,
          nivel: clase.nivel,
        },
      },
    }),
  ]);

  if (unitCount !== unidades.length) {
    throw new Error('Una o más unidades no pertenecen al espacio curricular seleccionado');
  }
  if (competencyCount !== competencias.length) {
    throw new Error('Una o más competencias no corresponden a las unidades o al tramo de la clase');
  }
  if (contentCount !== contenidos.length) {
    throw new Error('Uno o más contenidos no corresponden a las unidades, nivel o tramo de la clase');
  }

  return {
    unidadCurricularIds: unidades,
    competenciaEspecificaIds: competencias,
    contenidoItemIds: contenidos,
  };
}

export async function getAll(
  userId: string,
  rol: Rol,
  filters: {
    claseId?: string;
    fecha?: string;
    fechaInicio?: string;
    fechaFin?: string;
    espacioId?: string;
    unidadId?: string;
    anoLectivoId?: string;
  }
) {
  let claseIdsPermitidos = await getClaseIdsParaUsuario(userId, rol);

  if (claseIdsPermitidos !== null && filters.claseId) {
    claseIdsPermitidos = claseIdsPermitidos.includes(filters.claseId) ? [filters.claseId] : [];
  }

  const claseWhere = {
    ...(claseIdsPermitidos !== null
      ? { id: { in: claseIdsPermitidos } }
      : filters.claseId
        ? { id: filters.claseId }
        : {}),
    ...(filters.anoLectivoId ? { anoLectivoId: filters.anoLectivoId } : {}),
  };

  const fechaFilter = filters.fecha
    ? { equals: new Date(filters.fecha) }
    : {
        ...(filters.fechaInicio ? { gte: new Date(filters.fechaInicio) } : {}),
        ...(filters.fechaFin ? { lte: new Date(filters.fechaFin) } : {}),
      };

  return prisma.planificacion.findMany({
    where: {
      ...(Object.keys(claseWhere).length ? { clase: claseWhere } : {}),
      ...(Object.keys(fechaFilter).length ? { fecha: fechaFilter } : {}),
      ...(filters.espacioId ? { espacioCurricularId: filters.espacioId } : {}),
      ...(filters.unidadId
        ? { unidades: { some: { unidadCurricularId: filters.unidadId } } }
        : {}),
    },
    include: INCLUDE_LIST,
    orderBy: [{ fecha: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function getById(id: string, userId: string, rol: Rol) {
  const planificacion = await prisma.planificacion.findUnique({
    where: { id },
    include: {
      ...INCLUDE_FULL,
      adaptaciones: {
        include: { estudiantes: { include: { estudiante: true } } },
      },
      comentarios:
        rol === 'DIRECTORA' || rol === 'MAESTRA'
          ? {
              include: { autor: { select: { id: true, nombre: true } } },
              orderBy: { createdAt: 'asc' as const },
            }
          : false,
    },
  });

  if (!planificacion) throw new Error('Planificación no encontrada');
  await assertSharedClassAccess(userId, rol, planificacion.claseId);

  if (rol === 'MAESTRA' && planificacion.autorCreacionId !== userId) {
    return { ...planificacion, comentarios: [] };
  }

  return planificacion;
}

export async function create(
  data: {
    titulo?: string;
    descripcion: string;
    metasAprendizaje?: string;
    fecha: string;
    claseId: string;
    espacioCurricularId: string;
    unidadCurricularIds: string[];
    competenciaEspecificaIds: string[];
    contenidoItemIds: string[];
  },
  autorId: string,
  rol: Rol = 'MAESTRA'
) {
  await assertSharedClassAccess(autorId, rol, data.claseId);

  const selection = await validateCurriculumSelection(
    data.claseId,
    data.espacioCurricularId,
    data.unidadCurricularIds,
    data.competenciaEspecificaIds,
    data.contenidoItemIds
  );

  return prisma.planificacion.create({
    data: {
      titulo: data.titulo,
      descripcion: data.descripcion,
      metasAprendizaje: data.metasAprendizaje,
      fecha: new Date(data.fecha),
      claseId: data.claseId,
      espacioCurricularId: data.espacioCurricularId,
      autorCreacionId: autorId,
      autorUltimaEdicionId: autorId,
      unidades: {
        create: selection.unidadCurricularIds.map((id) => ({ unidadCurricularId: id })),
      },
      competenciasEspecificas: {
        create: selection.competenciaEspecificaIds.map((id) => ({ competenciaEspecificaId: id })),
      },
      contenidos: {
        create: selection.contenidoItemIds.map((id) => ({ contenidoItemId: id })),
      },
    },
    include: INCLUDE_FULL,
  });
}

export async function bulkCreate(
  templateData: {
    titulo?: string;
    descripcion: string;
    metasAprendizaje?: string;
    claseId: string;
    espacioCurricularId: string;
    unidadCurricularIds: string[];
    competenciaEspecificaIds: string[];
    contenidoItemIds: string[];
  },
  fechas: string[],
  autorId: string,
  rol: Rol = 'MAESTRA'
) {
  await assertSharedClassAccess(autorId, rol, templateData.claseId);

  const selection = await validateCurriculumSelection(
    templateData.claseId,
    templateData.espacioCurricularId,
    templateData.unidadCurricularIds,
    templateData.competenciaEspecificaIds,
    templateData.contenidoItemIds
  );

  const uniqueDates = unique(fechas);

  return prisma.$transaction(
    uniqueDates.map((fecha) =>
      prisma.planificacion.create({
        data: {
          titulo: templateData.titulo,
          descripcion: templateData.descripcion,
          metasAprendizaje: templateData.metasAprendizaje,
          fecha: new Date(fecha),
          claseId: templateData.claseId,
          espacioCurricularId: templateData.espacioCurricularId,
          autorCreacionId: autorId,
          autorUltimaEdicionId: autorId,
          unidades: {
            create: selection.unidadCurricularIds.map((id) => ({ unidadCurricularId: id })),
          },
          competenciasEspecificas: {
            create: selection.competenciaEspecificaIds.map((id) => ({ competenciaEspecificaId: id })),
          },
          contenidos: {
            create: selection.contenidoItemIds.map((id) => ({ contenidoItemId: id })),
          },
        },
        include: INCLUDE_LIST,
      })
    )
  );
}

export async function update(
  id: string,
  data: {
    titulo?: string;
    descripcion?: string;
    metasAprendizaje?: string;
    fecha?: string;
    espacioCurricularId?: string;
    unidadCurricularIds?: string[];
    competenciaEspecificaIds?: string[];
    contenidoItemIds?: string[];
  },
  autorId: string,
  userId: string,
  rol: Rol
) {
  const planificacion = await prisma.planificacion.findUnique({
    where: { id },
    include: {
      unidades: { select: { unidadCurricularId: true } },
      competenciasEspecificas: { select: { competenciaEspecificaId: true } },
      contenidos: { select: { contenidoItemId: true } },
    },
  });
  if (!planificacion) throw new Error('Planificación no encontrada');

  await assertSharedClassAccess(userId, rol, planificacion.claseId);

  const finalSpace = data.espacioCurricularId ?? planificacion.espacioCurricularId;
  const finalUnits =
    data.unidadCurricularIds ?? planificacion.unidades.map((item) => item.unidadCurricularId);
  const finalCompetencies =
    data.competenciaEspecificaIds ??
    planificacion.competenciasEspecificas.map((item) => item.competenciaEspecificaId);
  const finalContents =
    data.contenidoItemIds ?? planificacion.contenidos.map((item) => item.contenidoItemId);

  const selection = await validateCurriculumSelection(
    planificacion.claseId,
    finalSpace,
    finalUnits,
    finalCompetencies,
    finalContents
  );

  return prisma.$transaction(async (tx) => {
    if (data.unidadCurricularIds !== undefined || data.espacioCurricularId !== undefined) {
      await tx.planificacionUnidadCurricular.deleteMany({ where: { planificacionId: id } });
    }
    if (data.competenciaEspecificaIds !== undefined || data.unidadCurricularIds !== undefined || data.espacioCurricularId !== undefined) {
      await tx.planificacionCE.deleteMany({ where: { planificacionId: id } });
    }
    if (data.contenidoItemIds !== undefined || data.unidadCurricularIds !== undefined || data.espacioCurricularId !== undefined) {
      await tx.planificacionContenido.deleteMany({ where: { planificacionId: id } });
    }

    return tx.planificacion.update({
      where: { id },
      data: {
        ...(data.titulo !== undefined ? { titulo: data.titulo } : {}),
        ...(data.descripcion !== undefined ? { descripcion: data.descripcion } : {}),
        ...(data.metasAprendizaje !== undefined ? { metasAprendizaje: data.metasAprendizaje } : {}),
        ...(data.fecha ? { fecha: new Date(data.fecha) } : {}),
        ...(data.espacioCurricularId ? { espacioCurricularId: finalSpace } : {}),
        autorUltimaEdicionId: autorId,
        ...(data.unidadCurricularIds !== undefined || data.espacioCurricularId !== undefined
          ? { unidades: { create: selection.unidadCurricularIds.map((uid) => ({ unidadCurricularId: uid })) } }
          : {}),
        ...(data.competenciaEspecificaIds !== undefined || data.unidadCurricularIds !== undefined || data.espacioCurricularId !== undefined
          ? { competenciasEspecificas: { create: selection.competenciaEspecificaIds.map((cid) => ({ competenciaEspecificaId: cid })) } }
          : {}),
        ...(data.contenidoItemIds !== undefined || data.unidadCurricularIds !== undefined || data.espacioCurricularId !== undefined
          ? { contenidos: { create: selection.contenidoItemIds.map((cid) => ({ contenidoItemId: cid })) } }
          : {}),
      },
      include: INCLUDE_FULL,
    });
  });
}

export async function remove(id: string, userId: string, rol: Rol) {
  const planificacion = await prisma.planificacion.findUnique({ where: { id } });
  if (!planificacion) throw new Error('Planificación no encontrada');

  await assertSharedClassAccess(userId, rol, planificacion.claseId);
  await prisma.planificacion.delete({ where: { id } });
}
