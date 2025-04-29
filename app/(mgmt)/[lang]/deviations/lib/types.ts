import { ObjectId } from 'mongodb';

export type ApprovalType = {
  approved: boolean;
  by: string;
  at: Date | string;
  reason?: string; // Rejection reason when approved is false
  history?: ApprovalHistoryType[]; // History of approval status changes
};

export type ApprovalHistoryType = {
  approved: boolean;
  by: string;
  at: Date | string;
  reason?: string;
};

export type correctiveActionType = {
  description: string;
  responsible: string;
  deadline: Date;
  created: { at: Date; by: string };
  status: correctiveActionStatusType;
  history: correctiveActionStatusType[];
};

export type correctiveActionStatusType = {
  value: 'open' | 'closed' | 'overdue' | 'in progress' | 'rejected';
  comment?: string;
  executedAt: Date;
  changed: { at: Date; by: string };
};

export type AttachmentType = {
  filename: string;
  name: string;
  note?: string;
  uploadedBy: string;
  uploadedAt: Date | string;
  size: number;
  type: string;
};

export type DeviationType = {
  _id?: ObjectId;
  internalId?: string; // Format: "N/YYYY", e.g. "1/2023"
  status:
    | 'rejected'
    | 'approved'
    | 'in approval'
    | 'in progress'
    | 'closed'
    | 'draft'
    | 'to approve';
  articleNumber?: string;
  articleName?: string;
  workplace?: string;
  customerNumber?: string;
  customerName?: string;
  quantity?: { value?: number; unit?: string };
  charge?: string;
  reason?: string;
  timePeriod: { from: Date | string; to: Date | string };
  timePeriodLocalDateString?: { from: string; to: string };
  area?: string;
  description?: string;
  processSpecification?: string;
  customerAuthorization: boolean;
  owner: string;
  createdAt: Date | string;
  edited?: { at: Date | string; by: string };
  groupLeaderApproval?: ApprovalType;
  qualityManagerApproval?: ApprovalType;
  engineeringManagerApproval?: ApprovalType;
  maintenanceManagerApproval?: ApprovalType;
  productionManagerApproval?: ApprovalType;
  plantManagerApproval?: ApprovalType;
  correctiveActions: correctiveActionType[];
  attachments?: AttachmentType[];
};

export type DeviationReasonType = {
  value: string;
  label: string;
  pl: string;
};

export type DeviationAreaType = {
  value: string;
  label: string;
  pl: string;
};
