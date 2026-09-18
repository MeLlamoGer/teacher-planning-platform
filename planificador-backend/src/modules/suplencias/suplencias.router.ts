import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validateBody';
import { createSuplenciaSchema, updateSuplenciaSchema } from './suplencias.schemas';
import * as service from './suplencias.service';

const router = Router();
router.use(authenticate, authorize('DIRECTORA'));

router.get('/', async (_req: Request, res: Response) => {
  res.json(await service.getAll());
});

router.post('/', validateBody(createSuplenciaSchema), async (req: Request, res: Response) => {
  try {
    res.status(201).json(await service.create(req.body, req.user!.id));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/:id', validateBody(updateSuplenciaSchema), async (req: Request, res: Response) => {
  try {
    res.json(await service.update(req.params.id, req.body));
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

export default router;
