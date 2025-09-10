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
  printHydraLabelAipIp?: string;
  printHydraLabelAipWorkplacePosition?: number;
};
