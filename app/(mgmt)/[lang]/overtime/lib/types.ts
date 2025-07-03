import { EmployeeType } from '@/lib/types/employee-types';

// Update the status options for overtime hours submissions
export type OvertimeStatus = 'pending' | 'approved' | 'rejected' | 'accounted';

export type OvertimeSubmissionType = {
  _id: string;
  status: OvertimeStatus;
  supervisor: string; // Email of the supervisor who will approve
  workedDate: Date;
  hoursWorked: number; // Number of overtime hours worked
  reason: string; // Reason for overtime work
  description?: string; // Additional description of work performed
  note?: string; // Additional notes
  submittedAt: Date;
  submittedBy: string; // Email of the employee who submitted
  editedAt: Date;
  editedBy: string;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  accountedAt?: Date;
  accountedBy?: string;
  hasAttachment?: boolean;
};

// Legacy type alias for backward compatibility
export type OvertimeType = OvertimeSubmissionType;

export type overtimeRequestEmployeeType = EmployeeType & {
  agreedReceivingAt?: Date; // Date of receiving a day off
  agreedReceivingAtLocaleString?: string;
  note?: string;
};
