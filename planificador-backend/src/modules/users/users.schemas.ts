import { z } from 'zod';
import { Rol } from '@prisma/client';

export const createUserSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  rol: z.nativeEnum(Rol),
});

export const updateUserSchema = z.object({
  nombre: z.string().min(1).optional(),
  email: z.string().email().optional(),
  rol: z.nativeEnum(Rol).optional(),
  activo: z.boolean().optional(),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
