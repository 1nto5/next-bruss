export type DmcType = {
  status: string;
  pallet: string;
  dmc: string;
  workplace: string;
  article: string;
  operator: string | string[]; // Support both string (legacy) and array (new)
  time: string;
  hydra_batch?: string;
  hydra_operator?: string | string[]; // New field for hydra operator
  hydra_time?: string;
  pallet_batch?: string;
  pallet_time?: string;
  pallet_operator?: string | string[]; // Support both formats for pallet operator
  reworkReason?: string;
  rework_time?: string;
};

export type DmcTableDataType = DmcType & {
  timeLocaleString: string;
  reworkTimeLocaleString: string;
};

export type ArticleConfigType = {
  _id?: string;
  workplace: string;
  articleNumber: string;
  articleName: string;
  articleNote?: string;
  piecesPerBox: number;
  pallet?: boolean;
  boxesPerPallet?: number;
  dmc: string;
  dmcFirstValidation: string;
  secondValidation?: boolean;
  dmcSecondValidation?: string;
  hydraProcess: string;
  ford?: boolean;
  bmw?: boolean;
};
