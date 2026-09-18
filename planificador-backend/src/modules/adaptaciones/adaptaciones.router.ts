import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validateBody';
import { createAdaptacionSchema, updateAdaptacionSchema } from './adaptaciones.schemas';
import * as service from './adaptaciones.service';

export const adaptacionesPlanifRouter = Router({ mergeParams: true });
adaptacionesPlanifRouter.use(authenticate);

adaptacionesPlanifRouter.get('/', async (req: Request, res: Response) => {
  res.json(await service.getByPlanificacion(req.params.planificacionId));
});

adaptacionesPlanifRouter.post(
  '/',
  authorize('MAESTRA', 'DIRECTORA'),
  validateBody(createAdaptacionSchema),
  async (req: Request, res: Response) => {
    try {
      res.status(201).json(await service.create(req.params.planificacionId, req.body));
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

export const adaptacionesRouter = Router();
adaptacionesRouter.use(authenticate, authorize('MAESTRA', 'DIRECTORA'));

adaptacionesRouter.put('/:id', validateBody(updateAdaptacionSchema), async (req: Request, res: Response) => {
  try {
    res.json(await service.update(req.params.id, req.body));
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

adaptacionesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id);
    res.json({ mensaje: 'Adaptación eliminada' });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});
