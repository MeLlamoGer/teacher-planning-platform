import { Request, Response, NextFunction } from 'express';
import { Rol } from '@prisma/client';

export function authorize(...roles: Rol[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!roles.includes(req.user.rol)) {
      res.status(403).json({ error: 'No tenés permisos para realizar esta acción' });
      return;
    }
    next();
  };
}
