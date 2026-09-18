import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as service from './curriculum.service';

const router = Router();
router.use(authenticate);

router.get('/espacios', async (_req: Request, res: Response) => {
  res.json(await service.getEspacios());
});

router.get('/unidades', async (req: Request, res: Response) => {
  res.json(await service.getUnidades(req.query.espacioId as string | undefined));
});

router.get('/competencias', async (_req: Request, res: Response) => {
  res.json(await service.getCompetencias());
});

router.get('/competencias-especificas', async (req: Request, res: Response) => {
  const { unidadCurricularId, tramo } = req.query as Record<string, string>;
  if (!unidadCurricularId || !tramo) {
    res.status(400).json({ error: 'unidadCurricularId y tramo son requeridos' });
    return;
  }
  res.json(await service.getCompetenciasEspecificas(unidadCurricularId, tramo));
});

router.get('/bloques-contenido', async (req: Request, res: Response) => {
  const { unidadCurricularId, tramo, nivel } = req.query as Record<string, string>;
  if (!unidadCurricularId || !tramo) {
    res.status(400).json({ error: 'unidadCurricularId y tramo son requeridos' });
    return;
  }
  res.json(await service.getBloquesContenido(unidadCurricularId, tramo, nivel));
});

export default router;
