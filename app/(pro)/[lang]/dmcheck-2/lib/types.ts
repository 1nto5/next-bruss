export type OperatorType = {
  identifier: string;
  firstName: string;
  lastName: string;
};

export type ArticleConfigType = {
  _id: string;
  articleNumber: string;
  articleName: string;
  workplace: string;
  piecesPerBox: number;
  boxesPerPallet?: number;
  pallet: boolean;
  dmc: {
    length: number;
  };
  dmcFirstValidation: string;
  dmcSecondValidation?: string;
  secondValidation: boolean;
  ford: boolean;
  bmw: boolean;
  nonUniqueHydraBatch?: boolean;
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