import { Rol } from '@prisma/client';

export { Rol };

export const ROLES = {
  MAESTRA: 'MAESTRA' as Rol,
  DIRECTORA: 'DIRECTORA' as Rol,
  SECRETARIA: 'SECRETARIA' as Rol,
  SUPLENTE: 'SUPLENTE' as Rol,
};
