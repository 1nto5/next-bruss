export type OvenProcessType = {
  id: string;
  oven: string;
  hydraBatch: string;
  operator: string[];
  status: 'running' | 'finished';
  startTime: Date;
  endTime: Date;
};
