import { Request, Response } from 'express';
import * as usersService from './users.service';

export async function getAll(_req: Request, res: Response): Promise<void> {
  const usuarios = await usersService.getAll();
  res.json(usuarios);
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const usuario = await usersService.getById(req.params.id);
    res.json(usuario);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const usuario = await usersService.create(req.body);
    res.status(201).json(usuario);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const usuario = await usersService.update(req.params.id, req.body);
    res.json(usuario);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
}

export async function updatePassword(req: Request, res: Response): Promise<void> {
  try {
    await usersService.updatePassword(req.params.id, req.body.password);
    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const usuario = await usersService.remove(req.params.id);
    res.json(usuario);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
}
