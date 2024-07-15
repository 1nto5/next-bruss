import { ObjectId } from 'mongodb';

type ApprovalType = {
  approved: boolean;
  approver: string;
  time: Date;
};

export type DeviationType = {
  _id?: ObjectId;
  deviationId: string;
  status: string;
  articleNumber: string;
  articleName: string;
  workplace: string;
  timePeriod: { from: Date; to: Date };
  drawingNumber: string;
  quantity: number;
  reason: string;
  description: string;
  owner: string;
  createdAt: Date;
  edited: { at: Date; by: string };
  closedAt: Date;
  // customerApproval: ApprovalType;
  groupLeaderApproval: ApprovalType;
  qualityApproval: ApprovalType;
  engineeringAproval: ApprovalType;
  maintenanceApproval: ApprovalType;
  productionManagerApproval: ApprovalType;
  // plantManagerApproval: ApprovalType;
};
