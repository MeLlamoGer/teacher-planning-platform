import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validateBody';
import {
  createPlanificacionSchema,
  updatePlanificacionSchema,
  bulkCreateSchema,
  querySchema,
} from './planificaciones.schemas';
import * as service from './planificaciones.service';
import * as archivosService from '../archivos/archivos.service';
import { ALLOWED_MIME_TYPES } from '../../config/constants';
import { env } from '../../config/env';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de archivo no permitido. Solo imágenes y PDF.'));
  },
});

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  const query = querySchema.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: 'Parámetros inválidos', detalles: query.error.flatten().fieldErrors });
    return;
  }
  res.json(await service.getAll(req.user!.id, req.user!.rol, query.data));
});

router.post('/', authorize('MAESTRA', 'DIRECTORA'), validateBody(createPlanificacionSchema), async (req: Request, res: Response) => {
  try {
    res.status(201).json(await service.create(req.body, req.user!.id, req.user!.rol));
  } catch (err) {
    const message = (err as Error).message;
    res.status(message === 'Acceso denegado' ? 403 : 400).json({ error: message });
  }
});

router.post('/bulk', authorize('MAESTRA', 'DIRECTORA'), validateBody(bulkCreateSchema), async (req: Request, res: Response) => {
  try {
    const { templateData, fechas } = req.body;
    res.status(201).json(await service.bulkCreate(templateData, fechas, req.user!.id, req.user!.rol));
  } catch (err) {
    const message = (err as Error).message;
    res.status(message === 'Acceso denegado' ? 403 : 400).json({ error: message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    res.json(await service.getById(req.params.id, req.user!.id, req.user!.rol));
  } catch (err) {
    const msg = (err as Error).message;
    res.status(msg === 'Acceso denegado' ? 403 : 404).json({ error: msg });
  }
});

router.put('/:id', authorize('MAESTRA', 'DIRECTORA'), validateBody(updatePlanificacionSchema), async (req: Request, res: Response) => {
  try {
    res.json(await service.update(req.params.id, req.body, req.user!.id, req.user!.id, req.user!.rol));
  } catch (err) {
    const msg = (err as Error).message;
    res.status(msg === 'Acceso denegado' ? 403 : 404).json({ error: msg });
  }
});

router.delete('/:id', authorize('MAESTRA', 'DIRECTORA'), async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id, req.user!.id, req.user!.rol);
    res.json({ mensaje: 'Planificación eliminada' });
  } catch (err) {
    const msg = (err as Error).message;
    res.status(msg === 'Acceso denegado' ? 403 : 404).json({ error: msg });
  }
});

router.post('/:id/archivos', authorize('MAESTRA', 'DIRECTORA'), upload.single('archivo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Archivo requerido' });
      return;
    }
    res.status(201).json(await archivosService.upload(req.params.id, req.file, req.user!.id, req.user!.rol));
  } catch (err) {
    const message = (err as Error).message;
    res.status(message === 'Acceso denegado' ? 403 : 400).json({ error: message });
  }
});

export default router;
