import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { claseAccess } from '../../middleware/claseAccess';
import { validateBody } from '../../middleware/validateBody';
import { createEstudianteSchema, updateEstudianteSchema } from './estudiantes.schemas';
import * as service from './estudiantes.service';

const router = Router({ mergeParams: true });
router.use(authenticate);

router.get('/', claseAccess, async (req: Request, res: Response) => {
  res.json(await service.getByClase(req.params.claseId, req.query.anoLectivoId as string | undefined));
});

router.post(
  '/',
  authorize('MAESTRA', 'DIRECTORA'),
  claseAccess,
  validateBody(createEstudianteSchema),
  async (req: Request, res: Response) => {
    try {
      res.status(201).json(await service.create(req.params.claseId, req.body));
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

router.put(
  '/:estudianteId',
  authorize('MAESTRA', 'DIRECTORA'),
  claseAccess,
  validateBody(updateEstudianteSchema),
  async (req: Request, res: Response) => {
    try {
      res.json(await service.update(req.params.estudianteId, req.body));
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  }
);

export default router;
