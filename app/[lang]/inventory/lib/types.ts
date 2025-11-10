export type PositionType = {
  position: number;
  identifier: string;
  time: string;
  articleNumber: string;
  articleName: string;
  quantity: number;
  unit: string;
  wip: boolean;
  approver: string;
  approvedAt: string;
  comment: string;
  bin: string;
  deliveryDate: Date;
};

export type CardPositionsTableDataType = PositionType & {
  timeLocaleString: string;
  approvedAtLocaleString: string;
  deliveryDateLocaleString: string;
};

export type CardType = {
  number: number;
  creators: string[];
  warehouse: string;
  sector: string;
  time: string;
  positions: PositionType[];
};

export type CardTableDataType = CardType & {
  positionsLength: number;
  approvedPositions: number;
};
