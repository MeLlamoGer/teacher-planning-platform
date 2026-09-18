import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validateBody';
import { createDificultadSchema, updateDificultadSchema } from './dificultades.schemas';
import * as service from './dificultades.service';

export const dificultadesEstudianteRouter = Router({ mergeParams: true });
dificultadesEstudianteRouter.use(authenticate);

dificultadesEstudianteRouter.get('/', async (req: Request, res: Response) => {
  res.json(await service.getByEstudiante(req.params.estudianteId));
});

dificultadesEstudianteRouter.post(
  '/',
  authorize('MAESTRA', 'DIRECTORA'),
  validateBody(createDificultadSchema),
  async (req: Request, res: Response) => {
    try {
      res.status(201).json(await service.create(req.params.estudianteId, req.body));
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

export const clasesDificultadesRouter = Router({ mergeParams: true });
clasesDificultadesRouter.use(authenticate);
clasesDificultadesRouter.get('/', async (req: Request, res: Response) => {
  res.json(await service.getByClase(req.params.claseId, req.query.espacioCurricularId as string | undefined));
});

export const dificultadesRouter = Router();
dificultadesRouter.use(authenticate, authorize('MAESTRA', 'DIRECTORA'));

dificultadesRouter.put('/:id', validateBody(updateDificultadSchema), async (req: Request, res: Response) => {
  try {
    res.json(await service.update(req.params.id, req.body));
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

dificultadesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id);
    res.json({ mensaje: 'Dificultad eliminada' });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});
