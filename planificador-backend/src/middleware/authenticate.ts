import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticación requerido' });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, rol: payload.rol };
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
