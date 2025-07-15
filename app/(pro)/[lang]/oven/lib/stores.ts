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
  setSelectedOven: (oven: string) => void;
  clearOven: () => void;
};

export const useOvenStore = create<OvenStateType>((set) => ({
  selectedOven: '',
  setSelectedOven: (oven: string) => set({ selectedOven: oven }),
  clearOven: () => set({ selectedOven: '' }),
}));
