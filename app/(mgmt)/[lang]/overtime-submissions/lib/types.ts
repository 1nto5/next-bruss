import { OvertimeSubmissionType as BaseOvertimeSubmissionType } from './zod';

// Update the status options for overtime submissions
export type OvertimeStatus = 'pending' | 'approved' | 'rejected' | 'accounted';

// Extend the Zod schema type with additional fields needed for the complete submission
export type OvertimeSubmissionType = BaseOvertimeSubmissionType & {
  _id: string;
  status: OvertimeStatus;
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
};
