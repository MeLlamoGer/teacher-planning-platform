import { z } from 'zod';
import { Rol } from '@prisma/client';

const emailSchema = z.string().trim().email('Email inválido').transform((value) => value.toLowerCase());

export const createUserSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(120),
  email: emailSchema,
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128),
  rol: z.nativeEnum(Rol),
});

export const updateUserSchema = z.object({
  nombre: z.string().trim().min(1).max(120).optional(),
  email: emailSchema.optional(),
  rol: z.nativeEnum(Rol).optional(),
  activo: z.boolean().optional(),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
