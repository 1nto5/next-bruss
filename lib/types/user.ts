import { ObjectId } from 'mongodb';

export type UserType = {
  _id: string;
  email: string;
  roles?: string[];
};
