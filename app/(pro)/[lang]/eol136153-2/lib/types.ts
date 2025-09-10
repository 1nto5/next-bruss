export type ArticleConfig = {
  article: string;
  name: string;
  type: string;
  palletSize: number;
  boxSize: number;
  hydraProc: string;
  palletProc?: string;
};

export type HydraScanResult = {
  status: 
    | 'saved'
    | 'exists'
    | 'invalid'
    | 'wrong article'
    | 'wrong quantity'
    | 'wrong process'
    | 'full pallet'
    | 'error';
  article?: string;
  batch?: string;
};

export type PalletScanResult = {
  status: 'success' | 'error' | 'invalid';
  palletBatch?: string;
};

export type ArticleStatus = {
  article: string;
  name: string;
  boxesOnPallet: number;
  palletSize: number;
  isFull: boolean;
  lastBatch?: string;
};

export type LoginType = {
  identifier: string;
};