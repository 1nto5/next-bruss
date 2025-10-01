import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ArticleConfigType } from './types';

type OperatorType = {
  identifier: string;
  firstName: string;
  lastName: string;
};

type ScanType = {
  dmc: string;
  time: Date;
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
    { name: 'dmcheck2-operators' },
  ),
);

type ScanStoreType = {
  selectedArticle: ArticleConfigType | null;
  lastScans: ScanType[];
  isRework: boolean;
  boxStatus: {
    piecesInBox: number;
    boxIsFull: boolean;
  };
  palletStatus: {
    boxesOnPallet: number;
    palletIsFull: boolean;
  };
  setSelectedArticle: (article: ArticleConfigType | null) => void;
  addScan: (dmc: string) => void;
  removeScan: (dmc: string) => void;
  setIsRework: (isRework: boolean) => void;
  updateBoxStatus: (piecesInBox: number, boxIsFull: boolean) => void;
  updatePalletStatus: (boxesOnPallet: number, palletIsFull: boolean) => void;
  clearArticle: () => void;
  clearScans: () => void;
};

export const useScanStore = create<ScanStoreType>()(
  persist(
    (set) => ({
      selectedArticle: null,
      lastScans: [],
      isRework: false,
      boxStatus: {
        piecesInBox: 0,
        boxIsFull: false,
      },
      palletStatus: {
        boxesOnPallet: 0,
        palletIsFull: false,
      },
      setSelectedArticle: (article) => set({
        selectedArticle: article,
        lastScans: [],
        isRework: false,
        boxStatus: { piecesInBox: 0, boxIsFull: false },
        palletStatus: { boxesOnPallet: 0, palletIsFull: false },
      }),
      addScan: (dmc) => set((state) => ({
        lastScans: [
          { dmc, time: new Date() },
          ...state.lastScans.slice(0, 4), // Keep only last 5
        ],
      })),
      removeScan: (dmc) => set((state) => ({
        lastScans: state.lastScans.filter((scan) => scan.dmc !== dmc),
      })),
      setIsRework: (isRework) => set({ isRework }),
      updateBoxStatus: (piecesInBox, boxIsFull) => set({
        boxStatus: { piecesInBox, boxIsFull },
      }),
      updatePalletStatus: (boxesOnPallet, palletIsFull) => set({
        palletStatus: { boxesOnPallet, palletIsFull },
      }),
      clearArticle: () => set({
        selectedArticle: null,
        lastScans: [],
        isRework: false,
        boxStatus: { piecesInBox: 0, boxIsFull: false },
        palletStatus: { boxesOnPallet: 0, palletIsFull: false },
      }),
      clearScans: () => set({ lastScans: [] }),
    }),
    { name: 'dmcheck2-scans' },
  ),
);

// Volume store
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
    { name: 'dmcheck2-volume' },
  ),
);