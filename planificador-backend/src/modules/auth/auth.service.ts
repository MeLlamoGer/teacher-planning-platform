import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';

export async function login(email: string, password: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.activo) throw new Error('Credenciales inválidas');

  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValida) throw new Error('Credenciales inválidas');

  return {
    accessToken: signAccessToken({ sub: usuario.id, rol: usuario.rol }),
    refreshToken: signRefreshToken({ sub: usuario.id }),
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  };
}

export async function refresh(token: string) {
  const payload = verifyRefreshToken(token);
  const usuario = await prisma.usuario.findUnique({ where: { id: payload.sub } });
  if (!usuario || !usuario.activo) throw new Error('Token inválido');
  return {
    accessToken: signAccessToken({ sub: usuario.id, rol: usuario.rol }),
    refreshToken: signRefreshToken({ sub: usuario.id }),
  };
}

export async function getMe(userId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { id: true, nombre: true, email: true, rol: true, activo: true },
  });
  if (!usuario) throw new Error('Usuario no encontrado');
  return usuario;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
