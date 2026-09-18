import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validateBody';
import { createComentarioSchema, updateComentarioSchema } from './comentarios.schemas';
import * as service from './comentarios.service';

export const comentariosPlanifRouter = Router({ mergeParams: true });
comentariosPlanifRouter.use(authenticate);

comentariosPlanifRouter.get('/', async (req: Request, res: Response) => {
  try {
    res.json(await service.getByPlanificacion(req.params.planificacionId, req.user!.id, req.user!.rol));
  } catch (err) {
    const msg = (err as Error).message;
    res.status(msg === 'Acceso denegado' ? 403 : 404).json({ error: msg });
  }
});

comentariosPlanifRouter.post(
  '/',
  authorize('DIRECTORA'),
  validateBody(createComentarioSchema),
  async (req: Request, res: Response) => {
    try {
      res.status(201).json(await service.create(req.params.planificacionId, req.body.texto, req.user!.id));
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

export const comentariosRouter = Router();
comentariosRouter.use(authenticate, authorize('DIRECTORA'));

comentariosRouter.put('/:id', validateBody(updateComentarioSchema), async (req: Request, res: Response) => {
  try {
    res.json(await service.update(req.params.id, req.body.texto));
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

comentariosRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id);
    res.json({ mensaje: 'Comentario eliminado' });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});
