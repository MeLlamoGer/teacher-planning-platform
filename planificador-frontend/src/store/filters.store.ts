import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FiltersStore {
  activeAnoLectivoId: string | null;
  activeClaseId: string | null;
  setAnoLectivo: (id: string | null) => void;
  setClase: (id: string | null) => void;
  reset: () => void;
}

export const useFiltersStore = create<FiltersStore>()(
  persist(
    (set) => ({
      activeAnoLectivoId: null,
      activeClaseId: null,
      setAnoLectivo: (id) => set({ activeAnoLectivoId: id }),
      setClase: (id) => set({ activeClaseId: id }),
      reset: () => set({ activeAnoLectivoId: null, activeClaseId: null }),
    }),
    {
      name: 'planificador-filters',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
