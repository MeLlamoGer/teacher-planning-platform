import api from '@/lib/axios';
import type { AlertaCobertura } from '@/types';

export interface CoberturaResult {
  porEspacio: { espacio: { id: string; nombre: string; color: string }; count: number }[];
  porUnidad: { unidad: { id: string; nombre: string; espacioCurricular: { nombre: string } }; count: number }[];
}

export const reportesApi = {
  getCobertura: (params: { claseId?: string; anoLectivoId?: string; fechaInicio?: string; fechaFin?: string; agruparPor?: string }) =>
    api.get<CoberturaResult>('/reportes/cobertura', { params }),
  getAlertas: (claseId?: string) =>
    api.get<AlertaCobertura[]>('/reportes/alertas', { params: claseId ? { claseId } : {} }),
};
