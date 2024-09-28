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
