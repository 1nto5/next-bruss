import { EmployeeType } from '@/lib/types/employee-types';

export type OvertimeType = {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  employees: selectedEmployeeForOvertimeType[];
  from: Date;
  fromLocaleString?: string;
  to: Date;
  toLocaleString?: string;
  reason: string;
  note: string;
  requestedAt: Date;
  requestedAtLocaleString?: string;
  requestedBy: string;
  editedAt: Date;
  editedBy: string;
  editedAtLocaleString?: string;
  approved?: boolean;
  approvedAt?: Date;
  approvedBy?: string;
  approvedAtLocaleString?: string;
};

export type selectedEmployeeForOvertimeType = EmployeeType & {
  agreedReceivingAt?: Date;
  note?: string;
};
