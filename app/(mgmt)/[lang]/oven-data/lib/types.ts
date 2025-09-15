export type OvenProcessDataType = {
  id: string;
  oven: string;
  article: string;
  hydraBatch: string;
  startOperators: string[];
  endOperators?: string[];
  status: 'prepared' | 'running' | 'finished' | 'deleted';
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
};

export type OvenTemperatureLogType = {
  _id: string;
  processIds: string[];
  timestamp: Date;
  timestampLocaleString: string;
  sensorData: Record<string, number>;
  avgTemp: number; // Now always the filtered average (excluding outliers)
  // Outlier detection fields
  outlierSensors: string[];
  medianTemp: number | null;
  hasOutliers: boolean;
};

export type OvenConfigType = {
  id: string;
  article: string;
  temp: number;
  tempTolerance: number;
  duration: number; // Duration in seconds
};
