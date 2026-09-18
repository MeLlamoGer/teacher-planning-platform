import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import {
  bloquesContenidoQuerySchema,
  competenciasEspecificasQuerySchema,
  unidadesQuerySchema,
} from './curriculum.schemas';
import * as service from './curriculum.service';

const router = Router();
router.use(authenticate);

router.get('/espacios', async (_req: Request, res: Response) => {
  res.json(await service.getEspacios());
});

router.get('/unidades', async (req: Request, res: Response) => {
  const parsed = unidadesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Parámetros inválidos', detalles: parsed.error.flatten().fieldErrors });
    return;
  }

  res.json(await service.getUnidades(parsed.data.espacioId));
});

router.get('/competencias', async (_req: Request, res: Response) => {
  res.json(await service.getCompetencias());
});

router.get('/competencias-especificas', async (req: Request, res: Response) => {
  const parsed = competenciasEspecificasQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Parámetros inválidos', detalles: parsed.error.flatten().fieldErrors });
    return;
  }

  res.json(
    await service.getCompetenciasEspecificas(
      parsed.data.unidadCurricularId,
      parsed.data.tramo
    )
  );
});

router.get('/bloques-contenido', async (req: Request, res: Response) => {
  const parsed = bloquesContenidoQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Parámetros inválidos', detalles: parsed.error.flatten().fieldErrors });
    return;
  }

  res.json(
    await service.getBloquesContenido(
      parsed.data.unidadCurricularId,
      parsed.data.tramo,
      parsed.data.nivel
    )
  );
});

export default router;
