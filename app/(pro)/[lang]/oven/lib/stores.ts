import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OperatorType = {
  identifier: string;
  firstName: string;
  lastName: string;
};

type PersonalNumbersStateType = {
  operator1: OperatorType | null;
  operator2: OperatorType | null;
  operator3: OperatorType | null;
  setOperator1: (operator: OperatorType | null) => void;
  setOperator2: (operator: OperatorType | null) => void;
  setOperator3: (operator: OperatorType | null) => void;
  logout: () => void;
};

export const usePersonalNumberStore = create<PersonalNumbersStateType>()(
  persist(
    (set, get) => ({
      operator1: null,
      operator2: null,
      operator3: null,
      setOperator1: (operator) => set({ operator1: operator }),
      setOperator2: (operator) => set({ operator2: operator }),
      setOperator3: (operator) => set({ operator3: operator }),
      logout: () => set({ operator1: null, operator2: null, operator3: null }),
    }),
    { name: 'personal-numbers' },
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

export const useOvenStore = create<OvenStateType>((set) => ({
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
}));
