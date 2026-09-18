import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validateBody';
import { createClaseSchema, updateClaseSchema, asignarUsuarioSchema } from './clases.schemas';
import * as service from './clases.service';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  res.json(await service.getAll(req.user!.id, req.user!.rol, req.query.anoLectivoId as string | undefined));
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    res.json(await service.getById(req.params.id, req.user!.id, req.user!.rol));
  } catch (err) {
    const message = (err as Error).message;
    res.status(message === 'Acceso denegado' ? 403 : 404).json({ error: message });
  }
});

router.post('/', authorize('DIRECTORA'), validateBody(createClaseSchema), async (req: Request, res: Response) => {
  try {
    res.status(201).json(await service.create(req.body));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/:id', authorize('DIRECTORA'), validateBody(updateClaseSchema), async (req: Request, res: Response) => {
  try {
    res.json(await service.update(req.params.id, req.body));
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

router.post('/:id/usuarios', authorize('DIRECTORA'), validateBody(asignarUsuarioSchema), async (req: Request, res: Response) => {
  try {
    res.status(201).json(await service.asignarUsuario(req.params.id, req.body.usuarioId));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/:id/usuarios/:usuarioId', authorize('DIRECTORA'), async (req: Request, res: Response) => {
  try {
    await service.desasignarUsuario(req.params.id, req.params.usuarioId);
    res.json({ mensaje: 'Asignación eliminada' });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

export default router;
