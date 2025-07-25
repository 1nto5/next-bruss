export type DmcType = {
  status: string;
  pallet: string;
  dmc: string;
  workplace: string;
  article: string;
  operator: string;
  time: string;
  hydra_batch?: string;
  hydra_time?: string;
  pallet_batch?: string;
  pallet_time?: string;
  rework_reason?: string;
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
