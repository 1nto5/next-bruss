export type OvenProcessConfigType = {
  id: string;
  article: string;
  program: number;
};

export type OvenProgramConfigType = {
  id: string;
  program: number;
  temp: number;
  tempTolerance: number;
  duration: number; // Duration in seconds
  durationTolerance: number; // Duration tolerance in seconds
};

export type OvenProcessType = {
  id: string;
  oven: string;
  article: string; // Article number for the process
  hydraBatch: string;
  startOperators: string[];
  endOperators?: string[];
  status: 'prepared' | 'running' | 'finished' | 'deleted';
  startTime: Date;
  endTime: Date;
  // Saved target values from config at time of process creation
  targetTemp?: number;
  tempTolerance?: number;
  targetDuration?: number; // Duration in seconds
  durationTolerance?: number; // Duration tolerance in seconds
  // Server-calculated values
  isOverdue?: boolean; // True if currentTime > (startTime + targetDuration + durationTolerance)
};
