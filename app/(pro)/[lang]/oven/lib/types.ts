export type processType = {
  _id: string;
  articleNumber: string;
  articleName: string;
  temp: number;
  ovenTime: number;
  ovenNumber: number;
  operators: string[];
  plannedProcessEndTimeAt: Date;
  startProcessAt: Date;
  updatedAt: Date;
  terminatedAt?: Date;
};
