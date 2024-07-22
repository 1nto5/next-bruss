import { ObjectId } from 'mongodb';

type ApprovalType = {
  approved: boolean;
  by: string;
  at: Date;
};

export type DeviationType = {
  _id?: ObjectId;
  status: string;
  articleNumber?: string;
  articleName?: string;
  workplace?: string;
  drawingNumber?: string;
  quantity?: number;
  uni?: string;
  charge?: string;
  reason?: string;
  timePeriod: { from: Date | string; to: Date | string };
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
  qualityApproval?: ApprovalType;
  engineeringAproval?: ApprovalType;
  maintenanceApproval?: ApprovalType;
  productionManagerApproval?: ApprovalType;
  // plantManagerApproval: ApprovalType;
};

export type DeviationReasonType = {
  _id: ObjectId;
  content: string;
  created: { at: Date; by: string };
  edited?: { at: Date; by: string };
};
