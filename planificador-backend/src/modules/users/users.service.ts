import { prisma } from '../../lib/prisma';
import { hashPassword } from '../auth/auth.service';
import { CreateUserInput, UpdateUserInput } from './users.schemas';

const SELECT_USUARIO = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  createdAt: true,
};

export async function getAll() {
  return prisma.usuario.findMany({
    select: SELECT_USUARIO,
    orderBy: { nombre: 'asc' },
  });
}

export async function getById(id: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: {
      ...SELECT_USUARIO,
      clases: {
        include: {
          clase: {
            include: { anoLectivo: true },
          },
        },
      },
    },
  });
  if (!usuario) throw new Error('Usuario no encontrado');
  return usuario;
}

export async function create(data: CreateUserInput) {
  const existe = await prisma.usuario.findUnique({ where: { email: data.email } });
  if (existe) throw new Error('Ya existe un usuario con ese email');

  const passwordHash = await hashPassword(data.password);

  return prisma.usuario.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      passwordHash,
      rol: data.rol,
    },
    select: SELECT_USUARIO,
  });
}

export async function update(id: string, data: UpdateUserInput) {
  const current = await prisma.usuario.findUnique({ where: { id } });
  if (!current) throw new Error('Usuario no encontrado');

  if (data.email && data.email !== current.email) {
    const duplicate = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (duplicate) throw new Error('Ya existe un usuario con ese email');
  }

  if (data.rol && data.rol !== current.rol) {
    if (current.rol === 'MAESTRA' && data.rol !== 'MAESTRA') {
      const permanentAssignments = await prisma.usuarioClase.count({ where: { usuarioId: id } });
      if (permanentAssignments > 0) {
        throw new Error('Quitá las asignaciones permanentes de clase antes de cambiar el rol de la maestra');
      }
    }

    if (current.rol === 'SUPLENTE' && data.rol !== 'SUPLENTE') {
      const activeTemporaryAssignments = await prisma.accesoTemporalSuplencia.count({
        where: { usuarioId: id, activo: true },
      });
      if (activeTemporaryAssignments > 0) {
        throw new Error('Desactivá las suplencias vigentes antes de cambiar el rol del usuario');
      }
    }
  }

  return prisma.usuario.update({
    where: { id },
    data,
    select: SELECT_USUARIO,
  });
}

export async function updatePassword(id: string, password: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id }, select: { id: true } });
  if (!usuario) throw new Error('Usuario no encontrado');

  const passwordHash = await hashPassword(password);
  await prisma.usuario.update({
    where: { id },
    data: { passwordHash },
  });
}

export async function remove(id: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id }, select: { id: true } });
  if (!usuario) throw new Error('Usuario no encontrado');

  return prisma.usuario.update({
    where: { id },
    data: { activo: false },
    select: SELECT_USUARIO,
  });
}
