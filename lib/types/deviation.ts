import { ObjectId } from 'mongodb';

type ApprovalType = {
  approved: boolean;
  by: string;
  at: Date;
};

export type DeviationType = {
  _id?: ObjectId;
  deviationId: string;
  status: string;
  articleNumber: string;
  articleName: string;
  workplace: string;
  quarry: string;
  timePeriod: { from: Date; to: Date };
  drawingNumber: string;
  quantity: number;
  reason: string;
  description: string;
  customerAuthorization: string;
  owner: string;
  createdAt: Date;
  edited: { at: Date; by: string };
  approvedAt: Date;
  closedAt: Date;
  customerApproval: ApprovalType;
  groupLeaderApproval: ApprovalType;
  qualityApproval: ApprovalType;
  engineeringAproval: ApprovalType;
  maintenanceApproval: ApprovalType;
  productionManagerApproval: ApprovalType;
  // plantManagerApproval: ApprovalType;
};

export type DeviationReasonType = {
  _id: ObjectId;
  content: string;
  created: { at: Date; by: string };
  edited?: { at: Date; by: string };
};
