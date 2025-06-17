import { ProjectsType } from './zod';

export type ProjectsLocaleStringType = ProjectsType & {
  dateLocaleString: string;
};

export type ProjectsSummaryType = {
  project: string;
  time: number;
};
