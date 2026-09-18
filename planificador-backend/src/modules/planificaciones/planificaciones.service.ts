import { prisma } from '../../lib/prisma';
import { Rol } from '@prisma/client';

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

async function assertClassAccess(userId: string, rol: Rol, claseId: string) {
  const permitidas = await getClaseIdsParaUsuario(userId, rol);
  if (permitidas !== null && !permitidas.includes(claseId)) {
    throw new Error('Acceso denegado');
  }
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
  await assertClassAccess(userId, rol, planificacion.claseId);

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
  await assertClassAccess(autorId, rol, data.claseId);

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
        create: data.unidadCurricularIds.map((id) => ({ unidadCurricularId: id })),
      },
      competenciasEspecificas: {
        create: data.competenciaEspecificaIds.map((id) => ({ competenciaEspecificaId: id })),
      },
      contenidos: {
        create: data.contenidoItemIds.map((id) => ({ contenidoItemId: id })),
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
  await assertClassAccess(autorId, rol, templateData.claseId);

  return prisma.$transaction(
    fechas.map((fecha) =>
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
            create: templateData.unidadCurricularIds.map((id) => ({ unidadCurricularId: id })),
          },
          competenciasEspecificas: {
            create: templateData.competenciaEspecificaIds.map((id) => ({ competenciaEspecificaId: id })),
          },
          contenidos: {
            create: templateData.contenidoItemIds.map((id) => ({ contenidoItemId: id })),
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
  const planificacion = await prisma.planificacion.findUnique({ where: { id } });
  if (!planificacion) throw new Error('Planificación no encontrada');

  await assertClassAccess(userId, rol, planificacion.claseId);

  return prisma.$transaction(async (tx) => {
    if (data.unidadCurricularIds !== undefined) {
      await tx.planificacionUnidadCurricular.deleteMany({ where: { planificacionId: id } });
    }
    if (data.competenciaEspecificaIds !== undefined) {
      await tx.planificacionCE.deleteMany({ where: { planificacionId: id } });
    }
    if (data.contenidoItemIds !== undefined) {
      await tx.planificacionContenido.deleteMany({ where: { planificacionId: id } });
    }

    return tx.planificacion.update({
      where: { id },
      data: {
        ...(data.titulo !== undefined ? { titulo: data.titulo } : {}),
        ...(data.descripcion !== undefined ? { descripcion: data.descripcion } : {}),
        ...(data.metasAprendizaje !== undefined ? { metasAprendizaje: data.metasAprendizaje } : {}),
        ...(data.fecha ? { fecha: new Date(data.fecha) } : {}),
        ...(data.espacioCurricularId ? { espacioCurricularId: data.espacioCurricularId } : {}),
        autorUltimaEdicionId: autorId,
        ...(data.unidadCurricularIds !== undefined
          ? { unidades: { create: data.unidadCurricularIds.map((uid) => ({ unidadCurricularId: uid })) } }
          : {}),
        ...(data.competenciaEspecificaIds !== undefined
          ? { competenciasEspecificas: { create: data.competenciaEspecificaIds.map((cid) => ({ competenciaEspecificaId: cid })) } }
          : {}),
        ...(data.contenidoItemIds !== undefined
          ? { contenidos: { create: data.contenidoItemIds.map((cid) => ({ contenidoItemId: cid })) } }
          : {}),
      },
      include: INCLUDE_FULL,
    });
  });
}

export async function remove(id: string, userId: string, rol: Rol) {
  const planificacion = await prisma.planificacion.findUnique({ where: { id } });
  if (!planificacion) throw new Error('Planificación no encontrada');

  await assertClassAccess(userId, rol, planificacion.claseId);
  await prisma.planificacion.delete({ where: { id } });
}
