export type OperatorType = {
  identifier: string;
  firstName: string;
  lastName: string;
};

export type ArticleConfigType = {
  id: string;
  articleNumber: string;
  articleName: string;
  articleNote?: string;
  workplace: string;
  piecesPerBox: number;
  boxesPerPallet?: number;
  pallet: boolean;
  dmc: string;
  dmcFirstValidation: string;
  dmcSecondValidation?: string;
  secondValidation: boolean;
  hydraProcess?: boolean;
  ford: boolean;
  bmw: boolean;
  nonUniqueHydraBatch?: boolean;
  requireDmcPartVerification?: boolean;
};

export type ScanType = {
  dmc: string;
  time: Date;
};

export type BoxStatusType = {
  piecesInBox: number;
  boxIsFull: boolean;
};

export type PalletStatusType = {
  boxesOnPallet: number;
  palletIsFull: boolean;
};

export type SaveResultType = {
  message: string;
  dmc?: string;
  time?: string;
};