import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as service from './archivos.service';

const router = Router();
router.use(authenticate);

router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const { archivo, absolutePath } = await service.download(
      req.params.id,
      req.user!.id,
      req.user!.rol
    );

    const safeFilename = archivo.nombreOriginal.replace(/["\r\n]/g, '_');

    res.setHeader('Content-Type', archivo.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(safeFilename)}`
    );
    res.sendFile(absolutePath);
  } catch (err) {
    const message = (err as Error).message;
    res.status(message === 'Acceso denegado' ? 403 : 404).json({ error: message });
  }
});

router.delete('/:id', authorize('MAESTRA', 'DIRECTORA'), async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id, req.user!.id, req.user!.rol);
    res.json({ mensaje: 'Archivo eliminado' });
  } catch (err) {
    const message = (err as Error).message;
    res.status(message === 'Acceso denegado' ? 403 : 404).json({ error: message });
  }
});

export default router;
