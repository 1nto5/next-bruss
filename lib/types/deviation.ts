import { ObjectId } from 'mongodb';

export type ApprovalType = {
  approved: boolean;
  by: string;
  at: Date | string;
};

export type DeviationType = {
  _id?: ObjectId;
  id?: string;
  status:
    | 'rejected'
    | 'approved'
    | 'approval'
    | 'valid'
    | 'closed'
    | 'draft'
    | 'to approve';
  articleNumber?: string;
  articleName?: string;
  workplace?: string;
  drawingNumber?: string;
  quantity?: { value?: number; unit?: string };
  charge?: string;
  reason?: string;
  timePeriod: { from: Date | string; to: Date | string };
  timePeriodLocalDateString?: { from: string; to: string };
  area?: string;
  description?: string;
  processSpecification?: string;
  customerNumber?: string;
  customerAuthorization: boolean;
  owner: string;
  createdAt: Date | string;
  edited?: { at: Date | string; by: string };
  approvedAt?: Date | string;
  closedAt?: Date | string;
  groupLeaderApproval?: ApprovalType;
  qualityManagerApproval?: ApprovalType;
  engineeringManagerApproval?: ApprovalType;
  maintenanceManagerApproval?: ApprovalType;
  productionManagerApproval?: ApprovalType;
  // plantManagerApproval: ApprovalType;
};

export type DeviationReasonType = {
  _id: ObjectId;
  content: string;
  created: { at: Date | string; by: string };
  edited?: { at: Date | string; by: string };
};
