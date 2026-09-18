import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const TRAMO_LABELS: Record<string, string> = {
  INICIAL_TRAMO_1: 'Ciclo 1 · Tramo 1 (Nivel 3, 4 y 5)',
  PRIMARIA_TRAMO_2: 'Ciclo 1 · Tramo 2 (1ro y 2do)',
  PRIMARIA_TRAMO_3: 'Ciclo 2 · Tramo 1 (3ro y 4to)',
  PRIMARIA_TRAMO_4: 'Ciclo 2 · Tramo 2 (5to y 6to)',
};

export function detectarTramo(nivel: string): string {
  const n = nivel.toLowerCase().trim();
  if (n.includes('nivel 3') || n.includes('nivel 4') || n.includes('nivel 5') || n.includes('inicial')) {
    return 'INICIAL_TRAMO_1';
  }
  if (n.startsWith('1') || n.startsWith('2') || n === '1ro' || n === '2do') return 'PRIMARIA_TRAMO_2';
  if (n.startsWith('3') || n.startsWith('4') || n === '3ro' || n === '4to') return 'PRIMARIA_TRAMO_3';
  if (n.startsWith('5') || n.startsWith('6') || n === '5to' || n === '6to') return 'PRIMARIA_TRAMO_4';
  return 'PRIMARIA_TRAMO_2';
}
