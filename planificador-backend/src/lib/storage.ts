import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

export interface StoredFile {
  rutaAlmacenada: string;
  nombreOriginal: string;
  mimeType: string;
  tamanoBytes: number;
}

export interface StorageService {
  save(file: Express.Multer.File): Promise<StoredFile>;
  delete(rutaAlmacenada: string): Promise<void>;
  getAbsolutePath(rutaAlmacenada: string): string;
}

class LocalStorageService implements StorageService {
  private uploadsDir = path.resolve(env.UPLOADS_DIR);

  async save(file: Express.Multer.File): Promise<StoredFile> {
    await fs.mkdir(this.uploadsDir, { recursive: true });

    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    await fs.writeFile(path.join(this.uploadsDir, filename), file.buffer);

    return {
      rutaAlmacenada: filename,
      nombreOriginal: path.basename(file.originalname),
      mimeType: file.mimetype,
      tamanoBytes: file.size,
    };
  }

  async delete(rutaAlmacenada: string): Promise<void> {
    await fs.unlink(this.getAbsolutePath(rutaAlmacenada)).catch(() => undefined);
  }

  getAbsolutePath(rutaAlmacenada: string): string {
    const safeName = path.basename(rutaAlmacenada);
    return path.join(this.uploadsDir, safeName);
  }
}

export const storageService: StorageService = new LocalStorageService();
