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
  await getById(id);
  return prisma.usuario.update({
    where: { id },
    data,
    select: SELECT_USUARIO,
  });
}

export async function updatePassword(id: string, password: string) {
  await getById(id);
  const passwordHash = await hashPassword(password);
  await prisma.usuario.update({
    where: { id },
    data: { passwordHash },
  });
}

export async function remove(id: string) {
  await getById(id);
  return prisma.usuario.update({
    where: { id },
    data: { activo: false },
    select: SELECT_USUARIO,
  });
}
