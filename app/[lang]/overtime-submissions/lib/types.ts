import { OvertimeSubmissionType as BaseOvertimeSubmissionType } from './zod';

// Update the status options for overtime submissions
export type OvertimeStatus = 'pending' | 'pending-plant-manager' | 'approved' | 'rejected' | 'accounted' | 'cancelled';

// Status values that should appear in filters (excludes 'cancelled' as it's not used in filtering)
export const OVERTIME_FILTER_STATUSES = [
  'pending',
  'pending-plant-manager',
  'approved',
  'rejected',
  'accounted',
] as const satisfies readonly OvertimeStatus[];

// Edit history entry - stores only changed fields
export type EditHistoryEntry = {
  editedAt: Date;
  editedBy: string; // Email of the user who made the edit
  changes: {
    // Only fields that were actually changed
    supervisor?: { from: string; to: string };
    date?: { from: Date; to: Date };
    hours?: { from: number; to: number };
    reason?: { from: string; to: string };
    overtimeRequest?: { from: boolean; to: boolean };
    payment?: { from: boolean; to: boolean };
    scheduledDayOff?: { from: Date | undefined; to: Date | undefined };
    status?: { from: OvertimeStatus; to: OvertimeStatus };
  };
};

// Extend the Zod schema type with additional fields needed for the complete submission
export type OvertimeSubmissionType = BaseOvertimeSubmissionType & {
  _id: string;
  internalId?: string; // Format: "N/YY", e.g. "1/25" - Optional as existing submissions don't have it
  status: OvertimeStatus;
  submittedAt: Date;
  submittedBy: string; // Email of the employee who submitted
  editedAt: Date;
  editedBy: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  accountedAt?: Date;
  accountedBy?: string;
  payment: boolean;
  approvedAt?: Date;
  approvedBy?: string;
  plantManagerApprovedAt?: Date;
  plantManagerApprovedBy?: string;
  supervisorApprovedAt?: Date;
  supervisorApprovedBy?: string;
  editHistory?: EditHistoryEntry[]; // Unified edit history tracking only changed fields
};
