import { Request, Response, NextFunction } from 'express';
import { hasClassAccess } from '../lib/access';

export async function claseAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const claseId = req.params.claseId ?? req.body?.claseId;
  if (!claseId) {
    res.status(400).json({ error: 'ID de clase requerido' });
    return;
  }

  if (!(await hasClassAccess(req.user.id, req.user.rol, claseId))) {
    res.status(403).json({ error: 'No tenés acceso a esta clase' });
    return;
  }

  next();
}
