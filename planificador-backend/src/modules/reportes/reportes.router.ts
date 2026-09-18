import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as service from './reportes.service';

const router = Router();
router.use(authenticate, authorize('MAESTRA', 'DIRECTORA', 'SECRETARIA'));

router.get('/cobertura', async (req: Request, res: Response) => {
  const reporte = await service.getCobertura(req.user!.id, req.user!.rol, {
    claseId: req.query.claseId as string | undefined,
    anoLectivoId: req.query.anoLectivoId as string | undefined,
    fechaInicio: req.query.fechaInicio as string | undefined,
    fechaFin: req.query.fechaFin as string | undefined,
  });
  res.json(reporte);
});

router.get('/alertas', async (req: Request, res: Response) => {
  res.json(await service.getAlertas(req.user!.id, req.user!.rol, req.query.claseId as string | undefined));
});

export default router;
