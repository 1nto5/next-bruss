export type ScanType = {
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
};

export type ScanTableDataType = ScanType & {
  timeLocaleString: string;
};
