import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OperatorType = {
  personalNumber: string;
  firstName: string;
  lastName: string;
};

type PersonalNumbersStateType = {
  operator1: OperatorType | null;
  operator2: OperatorType | null;
  operator3: OperatorType | null;
  // Keep backward compatibility
  personalNumber1: string;
  personalNumber2: string;
  personalNumber3: string;
  setOperator1: (operator: OperatorType) => void;
  setOperator2: (operator: OperatorType) => void;
  setOperator3: (operator: OperatorType) => void;
  // Keep backward compatibility methods
  setPersonalNumber1: (personalNumber1: string) => void;
  setPersonalNumber2: (personalNumber2: string) => void;
  setPersonalNumber3: (personalNumber3: string) => void;
  logout: () => void;
};

export const usePersonalNumberStore = create<PersonalNumbersStateType>()(
  persist(
    (set, get) => ({
      operator1: null,
      operator2: null,
      operator3: null,
      personalNumber1: '',
      personalNumber2: '',
      personalNumber3: '',
      setOperator1: (operator) =>
        set({
          operator1: operator,
          personalNumber1: operator.personalNumber,
        }),
      setOperator2: (operator) =>
        set({
          operator2: operator,
          personalNumber2: operator.personalNumber,
        }),
      setOperator3: (operator) =>
        set({
          operator3: operator,
          personalNumber3: operator.personalNumber,
        }),
      // Keep backward compatibility
      setPersonalNumber1: (personalNumber1) => set({ personalNumber1 }),
      setPersonalNumber2: (personalNumber2) => set({ personalNumber2 }),
      setPersonalNumber3: (personalNumber3) => set({ personalNumber3 }),
      logout: () =>
        set({
          operator1: null,
          operator2: null,
          operator3: null,
          personalNumber1: '',
          personalNumber2: '',
          personalNumber3: '',
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
