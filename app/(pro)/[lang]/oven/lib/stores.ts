import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OperatorType = {
  identifier: string;
  firstName: string;
  lastName: string;
};

type OperatorStoreType = {
  operator1: OperatorType | null;
  operator2: OperatorType | null;
  operator3: OperatorType | null;
  setOperator1: (operator: OperatorType | null) => void;
  setOperator2: (operator: OperatorType | null) => void;
  setOperator3: (operator: OperatorType | null) => void;
  logout: () => void;
};

export const useOperatorStore = create<OperatorStoreType>()(
  persist(
    (set) => ({
      operator1: null,
      operator2: null,
      operator3: null,
      setOperator1: (operator) => set({ operator1: operator }),
      setOperator2: (operator) => set({ operator2: operator }),
      setOperator3: (operator) => set({ operator3: operator }),
      logout: () => set({ operator1: null, operator2: null, operator3: null }),
    }),
    { name: 'oven-operators' },
  ),
);

type OvenStateType = {
  selectedOven: string;
  selectedProgram: number | null;
  setSelectedOven: (oven: string) => void;
  setSelectedProgram: (program: number | null) => void;
  clearOven: () => void;
  clearProgram: () => void;
};

export const useOvenStore = create<OvenStateType>()(
  persist(
    (set) => ({
      selectedOven: '',
      selectedProgram: null,
      setSelectedOven: async (oven: string) => {
        set({ selectedOven: oven });
        
        // Automatically check for active program when oven is selected
        const { fetchActiveOvenProgram } = await import('../actions');
        const result = await fetchActiveOvenProgram(oven);
        
        if ('program' in result && result.program !== null) {
          set({ selectedProgram: result.program });
        }
      },
      setSelectedProgram: (program: number | null) => set({ selectedProgram: program }),
      clearOven: () => set({ selectedOven: '', selectedProgram: null }),
      clearProgram: () => set({ selectedProgram: null }),
    }),
    { name: 'oven-application' },
  ),
);

type VolumeStoreType = {
  volume: number;
  setVolume: (volume: number) => void;
};

export const useVolumeStore = create<VolumeStoreType>()(
  persist(
    (set) => ({
      volume: 0.75,
      setVolume: (volume) => set({ volume }),
    }),
    { name: 'oven-volume' },
  ),
);
