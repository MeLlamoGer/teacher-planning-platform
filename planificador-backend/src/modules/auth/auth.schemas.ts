import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Email inválido').transform((value) => value.toLowerCase()),
  password: z.string().min(1, 'La contraseña es requerida').max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;
