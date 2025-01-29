import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LoginType = {
  operator1: string;
  operator2: string;
  operator3: string;
  setOperator1: (operator1: string) => void;
  setOperator2: (operator2: string) => void;
  setOperator3: (operator3: string) => void;
  logout: () => void;
};

export const useLogin = create<LoginType>()(
  persist(
    (set) => ({
      operator1: '',
      operator2: '',
      operator3: '',
      setOperator1: (operator1) => set({ operator1 }),
      setOperator2: (operator2) => set({ operator2 }),
      setOperator3: (operator3) => set({ operator3 }),
      logout: () => set({ operator1: '', operator2: '', operator3: '' }),
    }),
    { name: 'login' },
  ),
);

// type CardStateType = {
//   card: number;
//   warehouse: string;
//   sector: string;
//   setCard: (card: number, warehouse: string, sector: string) => void;
// };

// export const useCardStore = create<CardStateType>((set) => ({
//   card: 0,
//   warehouse: '',
//   sector: '',
//   setCard: (card: number, warehouse: string, sector: string) =>
//     set({ card, warehouse, sector }),
// }));

// type PositionStateType = {
//   position: number;
//   setPosition: (position: number) => void;
// };

// export const usePositionStore = create<PositionStateType>((set) => ({
//   position: 0,
//   setPosition: (position: number) => set({ position }),
// }));
