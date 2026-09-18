import api from '@/lib/axios';
import type { EspacioCurricular, UnidadCurricular, CompetenciaEspecifica, BloqueContenido } from '@/types';

export const curriculumApi = {
  getEspacios: () => api.get<EspacioCurricular[]>('/curriculum/espacios'),
  getUnidades: (espacioId?: string) =>
    api.get<UnidadCurricular[]>('/curriculum/unidades', { params: espacioId ? { espacioId } : {} }),
  getCompetenciasEspecificas: (unidadCurricularId: string, tramo: string) =>
    api.get<CompetenciaEspecifica[]>('/curriculum/competencias-especificas', {
      params: { unidadCurricularId, tramo },
    }),
  getBloquesContenido: (unidadCurricularId: string, tramo: string, nivel?: string) =>
    api.get<BloqueContenido[]>('/curriculum/bloques-contenido', {
      params: { unidadCurricularId, tramo, ...(nivel ? { nivel } : {}) },
    }),
};
