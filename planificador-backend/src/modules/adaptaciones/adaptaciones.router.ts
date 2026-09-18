import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validateBody';
import { createAdaptacionSchema, updateAdaptacionSchema } from './adaptaciones.schemas';
import * as service from './adaptaciones.service';

function errorStatus(message: string) {
  if (message === 'Acceso denegado') return 403;
  if (message.includes('no encontrad')) return 404;
  return 400;
}

export const adaptacionesPlanifRouter = Router({ mergeParams: true });
adaptacionesPlanifRouter.use(authenticate);

adaptacionesPlanifRouter.get('/', async (req: Request, res: Response) => {
  try {
    res.json(await service.getByPlanificacion(req.params.planificacionId, req.user!.id, req.user!.rol));
  } catch (err) {
    const message = (err as Error).message;
    res.status(errorStatus(message)).json({ error: message });
  }
});

adaptacionesPlanifRouter.post(
  '/',
  authorize('MAESTRA', 'DIRECTORA'),
  validateBody(createAdaptacionSchema),
  async (req: Request, res: Response) => {
    try {
      res.status(201).json(
        await service.create(req.params.planificacionId, req.body, req.user!.id, req.user!.rol)
      );
    } catch (err) {
      const message = (err as Error).message;
      res.status(errorStatus(message)).json({ error: message });
    }
  }
);

export const adaptacionesRouter = Router();
adaptacionesRouter.use(authenticate, authorize('MAESTRA', 'DIRECTORA'));

adaptacionesRouter.put('/:id', validateBody(updateAdaptacionSchema), async (req: Request, res: Response) => {
  try {
    res.json(await service.update(req.params.id, req.body, req.user!.id, req.user!.rol));
  } catch (err) {
    const message = (err as Error).message;
    res.status(errorStatus(message)).json({ error: message });
  }
});

adaptacionesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id, req.user!.id, req.user!.rol);
    res.json({ mensaje: 'Adaptación eliminada' });
  } catch (err) {
    const message = (err as Error).message;
    res.status(errorStatus(message)).json({ error: message });
  }
});
