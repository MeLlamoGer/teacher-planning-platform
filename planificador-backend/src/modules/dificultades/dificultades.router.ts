import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validateBody';
import { createDificultadSchema, updateDificultadSchema } from './dificultades.schemas';
import * as service from './dificultades.service';

function errorStatus(message: string) {
  if (message === 'Acceso denegado') return 403;
  if (message.includes('no encontrad')) return 404;
  return 400;
}

export const dificultadesEstudianteRouter = Router({ mergeParams: true });
dificultadesEstudianteRouter.use(authenticate);

dificultadesEstudianteRouter.get('/', async (req: Request, res: Response) => {
  try {
    res.json(await service.getByEstudiante(req.params.estudianteId, req.user!.id, req.user!.rol));
  } catch (err) {
    const message = (err as Error).message;
    res.status(errorStatus(message)).json({ error: message });
  }
});

dificultadesEstudianteRouter.post(
  '/',
  authorize('MAESTRA', 'DIRECTORA'),
  validateBody(createDificultadSchema),
  async (req: Request, res: Response) => {
    try {
      res.status(201).json(
        await service.create(req.params.estudianteId, req.body, req.user!.id, req.user!.rol)
      );
    } catch (err) {
      const message = (err as Error).message;
      res.status(errorStatus(message)).json({ error: message });
    }
  }
);

export const clasesDificultadesRouter = Router({ mergeParams: true });
clasesDificultadesRouter.use(authenticate);
clasesDificultadesRouter.get('/', async (req: Request, res: Response) => {
  try {
    res.json(
      await service.getByClase(
        req.params.claseId,
        req.user!.id,
        req.user!.rol,
        req.query.espacioCurricularId as string | undefined
      )
    );
  } catch (err) {
    const message = (err as Error).message;
    res.status(errorStatus(message)).json({ error: message });
  }
});

export const dificultadesRouter = Router();
dificultadesRouter.use(authenticate, authorize('MAESTRA', 'DIRECTORA'));

dificultadesRouter.put('/:id', validateBody(updateDificultadSchema), async (req: Request, res: Response) => {
  try {
    res.json(await service.update(req.params.id, req.body, req.user!.id, req.user!.rol));
  } catch (err) {
    const message = (err as Error).message;
    res.status(errorStatus(message)).json({ error: message });
  }
});

dificultadesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id, req.user!.id, req.user!.rol);
    res.json({ mensaje: 'Dificultad eliminada' });
  } catch (err) {
    const message = (err as Error).message;
    res.status(errorStatus(message)).json({ error: message });
  }
});
