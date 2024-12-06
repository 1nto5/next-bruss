import { FailureZodType } from '../z/failure';

export type InsertFailureType = FailureZodType;

export type UpdateFailureType = Omit<
  InsertFailureType,
  'line' | 'station' | 'failure'
> & {
  _id: string;
  to?: Date;
};

export type FailureType = InsertFailureType & {
  _id: string;
  to?: string | Date;
  fromLocaleString: string;
  toLocaleString?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  duration: number;
};
