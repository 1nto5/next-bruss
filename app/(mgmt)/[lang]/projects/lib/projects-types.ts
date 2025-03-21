import { ProjectsType } from './projects-zod';

export type ProjectsLocaleStringType = ProjectsType & {
  dateLocaleString: string;
};

export type ProjectsSummaryType = {
  project: string;
  time: number;
};
