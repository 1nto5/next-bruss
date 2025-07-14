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
  lastActivity: string | null; // ISO string
  setOperator1: (operator: OperatorType | null) => void;
  setOperator2: (operator: OperatorType | null) => void;
  setOperator3: (operator: OperatorType | null) => void;
  setLastActivity: (isoString: string) => void;
  logout: () => void;
};

export const usePersonalNumberStore = create<PersonalNumbersStateType>()(
  persist(
    (set, get) => ({
      operator1: null,
      operator2: null,
      operator3: null,
      lastActivity: null,
      setOperator1: (operator) =>
        set({
          operator1: operator,
          lastActivity: new Date().toISOString(),
        }),
      setOperator2: (operator) =>
        set({
          operator2: operator,
          lastActivity: new Date().toISOString(),
        }),
      setOperator3: (operator) =>
        set({
          operator3: operator,
          lastActivity: new Date().toISOString(),
        }),
      setLastActivity: (isoString) => set({ lastActivity: isoString }),
      logout: () =>
        set({
          operator1: null,
          operator2: null,
          operator3: null,
          lastActivity: null,
        }),
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
