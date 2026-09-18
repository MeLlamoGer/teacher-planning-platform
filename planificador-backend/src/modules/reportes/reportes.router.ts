import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { alertasQuerySchema, coberturaQuerySchema } from './reportes.schemas';
import * as service from './reportes.service';

const router = Router();
router.use(authenticate, authorize('MAESTRA', 'DIRECTORA', 'SECRETARIA'));

router.get('/cobertura', async (req: Request, res: Response) => {
  const parsed = coberturaQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Parámetros inválidos', detalles: parsed.error.flatten().fieldErrors });
    return;
  }

  res.json(await service.getCobertura(req.user!.id, req.user!.rol, parsed.data));
});

router.get('/alertas', async (req: Request, res: Response) => {
  const parsed = alertasQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Parámetros inválidos', detalles: parsed.error.flatten().fieldErrors });
    return;
  }

  res.json(await service.getAlertas(req.user!.id, req.user!.rol, parsed.data.claseId));
});

export default router;
