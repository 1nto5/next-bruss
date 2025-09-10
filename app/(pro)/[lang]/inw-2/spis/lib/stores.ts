import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type PersonalNumbersStateType = {
  personalNumber1: string;
  personalNumber2: string;
  personalNumber3: string;
  setPersonalNumber1: (personalNumber1: string) => void;
  setPersonalNumber2: (personalNumber2: string) => void;
  setPersonalNumber3: (personalNumber3: string) => void;
  logout: () => void;
};

export const usePersonalNumberStore = create<PersonalNumbersStateType>()(
  persist(
    (set) => ({
      personalNumber1: '',
      personalNumber2: '',
      personalNumber3: '',
      setPersonalNumber1: (personalNumber1) => set({ personalNumber1 }),
      setPersonalNumber2: (personalNumber2) => set({ personalNumber2 }),
      setPersonalNumber3: (personalNumber3) => set({ personalNumber3 }),
      logout: () =>
        set({ personalNumber1: '', personalNumber2: '', personalNumber3: '' }),
    }),
    { name: 'personal-numbers' },
  ),
);

type CardStateType = {
  card: number;
  warehouse: string;
  sector: string;
  setCard: (card: number, warehouse: string, sector: string) => void;
};

export const useCardStore = create<CardStateType>((set) => ({
  card: 0,
  warehouse: '',
  sector: '',
  setCard: (card: number, warehouse: string, sector: string) =>
    set({ card, warehouse, sector }),
}));

type PositionStateType = {
  position: number;
  setPosition: (position: number) => void;
};

export const usePositionStore = create<PositionStateType>((set) => ({
  position: 0,
  setPosition: (position: number) => set({ position }),
}));
