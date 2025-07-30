export type OvenProcessConfigType = {
  id: string;
  article: string;
  temp: number;
  tempTolerance: number;
  duration: number; // Duration in seconds
};

export type OvenProcessType = {
  id: string;
  oven: string;
  article: string; // Article number for the process
  hydraBatch: string;
  operator: string[];
  status: 'running' | 'finished' | 'deleted';
  startTime: Date;
  endTime: Date;
  // Saved target values from config at time of process creation
  targetTemp?: number;
  tempTolerance?: number;
  targetDuration?: number; // Duration in seconds
  // Optional calculated values
  expectedCompletion?: Date;
  lastAvgTemp?: number | null;
};
