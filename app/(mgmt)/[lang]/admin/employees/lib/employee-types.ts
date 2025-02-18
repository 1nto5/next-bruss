export type EmployeeType = {
  _id?: string;
  firstName: string;
  lastName: string;
  identifier: string;
  pin?: string;
};

export type InsertEmployeeType = Omit<EmployeeType, '_id'>;
