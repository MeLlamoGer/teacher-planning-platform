import { Request, Response } from 'express';
import * as authService from './auth.service';
import { env } from '../../config/env';
import { REFRESH_TOKEN_COOKIE } from '../../config/constants';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, COOKIE_OPTIONS);
    res.json({ accessToken: result.accessToken, usuario: result.usuario });
  } catch (err) {
    res.status(401).json({ error: (err as Error).message });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!token) {
      res.status(401).json({ error: 'Refresh token requerido' });
      return;
    }
    const result = await authService.refresh(token);
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, COOKIE_OPTIONS);
    res.json({ accessToken: result.accessToken });
  } catch {
    res.status(401).json({ error: 'Refresh token inválido o expirado' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(REFRESH_TOKEN_COOKIE);
  res.json({ mensaje: 'Sesión cerrada correctamente' });
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const usuario = await authService.getMe(req.user!.id);
    res.json(usuario);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
}
