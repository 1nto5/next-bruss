import { EmployeeType } from '@/lib/types/employee-types';

// Add or update the status options to include 'closed'
export type OvertimeStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'closed';

export type OvertimeType = {
  _id: string;
  status: OvertimeStatus;
  numberOfEmployees: number; // Number of employees in the order
  employeesWithScheduledDayOff: overtimeRequestEmployeeType[]; // Employees who want to take time off
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
  approvedAt?: Date;
  approvedBy?: string;
  approvedAtLocaleString?: string;
  closedAt?: Date;
  closedBy?: string;
  hasAttachment?: boolean;
};

export type overtimeRequestEmployeeType = EmployeeType & {
  agreedReceivingAt?: Date; // Date of receiving a day off
  agreedReceivingAtLocaleString?: string;
  note?: string;
};
