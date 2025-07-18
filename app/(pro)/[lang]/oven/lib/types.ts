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
  status: 'running' | 'finished';
  startTime: Date;
  endTime: Date;
  // Optional config data populated from oven_process_configs
  config?: {
    temp: number;
    tempTolerance: number;
    duration: number;
    expectedCompletion: Date;
  };
};
