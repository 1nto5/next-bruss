import { ObjectId } from 'mongodb';

export type ApprovalType = {
  approved: boolean;
  by: string;
  at: Date;
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
    | string;
  articleNumber?: string;
  articleName?: string;
  workplace?: string;
  drawingNumber?: string;
  quantity?: { value?: number; unit?: string };
  charge?: string;
  reason?: string;
  timePeriod: { from: Date; to: Date };
  timePeriodLocalDateString?: { from: string; to: string };
  area?: string;
  description?: string;
  processSpecification?: string;
  customerNumber?: string;
  customerAuthorization: boolean;
  owner: string;
  createdAt: Date;
  edited?: { at: Date; by: string };
  approvedAt?: Date;
  closedAt?: Date;
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
  created: { at: Date; by: string };
  edited?: { at: Date; by: string };
};
