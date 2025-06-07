import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Operator = {
  code: string;
  name: string;
};

type OperatorsStateType = {
  operator1: Operator;
  operator2: Operator;
  operator3: Operator;
  setOperator1: (operator: Operator) => void;
  setOperator2: (operator: Operator) => void;
  setOperator3: (operator: Operator) => void;
  logout: () => void;
};

export const useOperatorsStore = create<OperatorsStateType>()(
  persist(
    (set) => ({
      operator1: { code: '', name: '' },
      operator2: { code: '', name: '' },
      operator3: { code: '', name: '' },
      setOperator1: (operator: Operator) => set({ operator1: operator }),
      setOperator2: (operator: Operator) => set({ operator2: operator }),
      setOperator3: (operator: Operator) => set({ operator3: operator }),
      logout: () =>
        set({
          operator1: { code: '', name: '' },
          operator2: { code: '', name: '' },
          operator3: { code: '', name: '' },
        }),
    }),
    { name: 'operators' },
  ),
);
