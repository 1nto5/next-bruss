import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CodesStateType = {
  code1: string;
  code2: string;
  code3: string;
  setCode1: (code1: string) => void;
  setCode2: (code2: string) => void;
  setCode3: (code3: string) => void;
  logout: () => void;
};

export const useCodeStore = create<CodesStateType>()(
  persist(
    (set) => ({
      code1: '',
      code2: '',
      code3: '',
      setCode1: (code1) => set({ code1 }),
      setCode2: (code2) => set({ code2 }),
      setCode3: (code3) => set({ code3 }),
      logout: () => set({ code1: '', code2: '', code3: '' }),
    }),
    { name: 'code' },
  ),
);
