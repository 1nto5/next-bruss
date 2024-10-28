export type PositionType = {
  position: number;
  identifier: string;
  time: string;
  articleNumber: string;
  articleName: string;
  quantity: number;
  unit: string;
  wip: boolean;
  creators: string[];
};

export type CardType = {
  number: number;
  creators: string[];
  warehouse: string;
  sector: string;
  time: string;
  positions: PositionType[];
};
