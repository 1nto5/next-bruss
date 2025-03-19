import { ProjectsType } from './projects-zod';

export type ProjectsLocaleStringType = ProjectsType & {
  dateLocaleString: string;
};
