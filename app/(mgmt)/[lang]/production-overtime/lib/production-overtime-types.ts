import { EmployeeType } from '@/lib/types/employee-types';

export type OvertimeType = {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  requestedBy: string;
  requestedFor: string;
  requestedForName: string;
  requestedForDepartment: string;
  requestedForDepartmentName: string;
  requestedForPosition: string;
  requestedForPositionName: string;
  requestedForWorkplace: string;
  requestedForWorkplaceName: string;
};

export type selectedEmployeeForOvertimeType = EmployeeType & {
  agreedReceivingAt?: Date;
  note?: string;
};
