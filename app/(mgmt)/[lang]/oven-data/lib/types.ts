export type OvenProcessDataType = {
  id: string;
  oven: string;
  article: string;
  hydraBatch: string;
  operator: string[];
  status: 'running' | 'finished';
  startTime: Date;
  endTime: Date | null;
  startTimeLocaleString: string;
  endTimeLocaleString: string;
  lastAvgTemp: number | null;
  duration?: number; // Duration in seconds for finished processes
  // Saved target values from config at time of process creation
  targetTemp?: number;
  tempTolerance?: number;
  targetDuration?: number; // Duration in seconds
  expectedCompletion?: Date;
};

export type OvenTemperatureLogType = {
  _id: string;
  processIds: string[];
  timestamp: Date;
  timestampLocaleString: string;
  sensorData: Record<string, number>;
  avgTemp: number;
};

export type OvenConfigType = {
  id: string;
  article: string;
  temp: number;
  tempTolerance: number;
  duration: number;
};
