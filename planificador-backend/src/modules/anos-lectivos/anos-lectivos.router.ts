import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validateBody';
import { createAnoLectivoSchema, updateAnoLectivoSchema } from './anos-lectivos.schemas';
import * as service from './anos-lectivos.service';

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response) => {
  res.json(await service.getAll());
});

router.post('/', authorize('DIRECTORA'), validateBody(createAnoLectivoSchema), async (req: Request, res: Response) => {
  try {
    res.status(201).json(await service.create(req.body.anio));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/:id', authorize('DIRECTORA'), validateBody(updateAnoLectivoSchema), async (req: Request, res: Response) => {
  try {
    res.json(await service.update(req.params.id, req.body.activo));
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

export default router;
