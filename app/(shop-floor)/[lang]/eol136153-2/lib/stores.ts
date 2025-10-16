import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OperatorType = {
  identifier: string;
  firstName: string;
  lastName: string;
};

type ScanType = {
  batch: string;
  article: string;
  time: Date;
};

type ArticleStatus = {
  article: string;
  name: string;
  boxesOnPallet: number;
  palletSize: number;
  isFull: boolean;
  lastBatch?: string;
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
    { name: 'eol136153-operator' },
  ),
);

type EOLStoreType = {
  article136Status: ArticleStatus | null;
  article153Status: ArticleStatus | null;
  lastScans: ScanType[];
  isScanning: boolean;
  currentMode: 'scanning' | 'pallet136' | 'pallet153';
  setArticle136Status: (status: ArticleStatus) => void;
  setArticle153Status: (status: ArticleStatus) => void;
  addScan: (batch: string, article: string) => void;
  setIsScanning: (isScanning: boolean) => void;
  setCurrentMode: (mode: 'scanning' | 'pallet136' | 'pallet153') => void;
  reset: () => void;
};

export const useEOLStore = create<EOLStoreType>()(
  persist(
    (set) => ({
      article136Status: null,
      article153Status: null,
      lastScans: [],
      isScanning: false,
      currentMode: 'scanning',
      setArticle136Status: (status) => set({ article136Status: status }),
      setArticle153Status: (status) => set({ article153Status: status }),
      addScan: (batch, article) => set((state) => ({
        lastScans: [
          { batch, article, time: new Date() },
          ...state.lastScans.slice(0, 9), // Keep last 10 scans
        ],
      })),
      setIsScanning: (isScanning) => set({ isScanning }),
      setCurrentMode: (mode) => set({ currentMode: mode }),
      reset: () => set({
        article136Status: null,
        article153Status: null,
        lastScans: [],
        isScanning: false,
        currentMode: 'scanning',
      }),
    }),
    { name: 'eol136153-state' },
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
    { name: 'eol136153-volume' },
  ),
);