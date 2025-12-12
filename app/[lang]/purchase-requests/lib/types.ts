// Purchase Request Status Flow:
// DRAFT → PENDING → PRE-APPROVED → APPROVED → ORDERED → RECEIVED → COMPLETED
//                       ↓                ↓
//                   REJECTED ←──────────┘

export type PurchaseRequestStatus =
  | 'draft'
  | 'pending'
  | 'pre-approved'
  | 'approved'
  | 'ordered'
  | 'received'
  | 'completed'
  | 'rejected';

export type CurrencyCode = 'EUR' | 'GBP' | 'USD' | 'PLN';

export type AttachmentType = {
  filename: string;
  originalName: string;
  uploadedBy: string;
  uploadedAt: Date | string;
  size: number;
};

export type CommentType = {
  content: string;
  createdBy: string;
  createdAt: Date | string;
};

export type EditLogType = {
  changedAt: Date | string;
  changedBy: string;
  fieldName: string;
  oldValue: any;
  newValue: any;
};

export type PurchaseRequestType = {
  _id: string;
  internalId: string; // Format: "PR-N/YY" e.g. "PR-1/25"
  status: PurchaseRequestStatus;

  // Core
  supplier?: string;
  supplierName?: string;
  currency: CurrencyCode;
  total: number;
  itemCount: number;

  // Requester
  requestedBy: string; // email
  requestedAt: Date | string;

  // Manager assignment (pre-approver)
  manager: string; // email

  // Pre-approval
  preApprovedBy?: string;
  preApprovedAt?: Date | string;
  preApprovalComment?: string;

  // Final approval
  approvedBy?: string;
  approvedAt?: Date | string;
  approvalComment?: string;

  // Rejection (can happen at any approval stage)
  rejectedBy?: string;
  rejectedAt?: Date | string;
  rejectionReason?: string;

  // Ordering
  orderNumber?: string; // optional internal reference
  orderedBy?: string;
  orderedAt?: Date | string;

  // Receiving
  receivedBy?: string;
  receivedAt?: Date | string;

  // Completion
  completedBy?: string;
  completedAt?: Date | string;

  // Cancellation
  canceledBy?: string;
  canceledAt?: Date | string;

  // Attachments (quotations/PDFs)
  attachments?: AttachmentType[];

  // Comments thread
  comments?: CommentType[];

  // Edit history
  editedBy?: string;
  editedAt?: Date | string;
  editLogs?: EditLogType[];
};

export type PurchaseRequestItemType = {
  _id: string;
  requestId: string;

  // Optional catalog reference
  article?: string;

  // Item-level supplier override
  supplier?: string;

  // Item details
  description: string;
  quantity: number;
  unitPrice: number;
  currency: CurrencyCode;
  euroRate: number; // EUR conversion rate at time of creation

  // Optional fields
  link?: string; // Web link to product
  reason?: string; // Purchase justification
  expectedDeliveryDate?: Date | string;
  toolNumber?: string; // Tool/mold number if applicable

  // Estimate flag
  isEstimate?: boolean;

  // Receiving tracking
  received: boolean;
  receivedAt?: Date | string;
  receivedBy?: string;
  receivedQuantity?: number;
};

export type ApproverLimitsType = {
  perUnit?: number; // Max per line item (EUR)
  daily?: number;
  weekly?: number;
  monthly?: number;
  yearly?: number;
};

export type ApproverAccumulatedType = {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  lastResetDaily?: Date | string;
  lastResetWeekly?: Date | string;
  lastResetMonthly?: Date | string;
  lastResetYearly?: Date | string;
};

export type PurchaseApproverType = {
  _id: string;
  userId: string; // email
  userName?: string;
  isFinalApprover: boolean;

  limits: ApproverLimitsType;
  accumulated: ApproverAccumulatedType;

  createdAt: Date | string;
  createdBy: string;
  updatedAt?: Date | string;
  updatedBy?: string;
};

// For form creation/editing
export type CreatePurchaseRequestInput = {
  supplier?: string;
  supplierName?: string;
  currency: CurrencyCode;
  manager: string;
  items: CreatePurchaseRequestItemInput[];
};

export type CreatePurchaseRequestItemInput = {
  article?: string;
  supplier?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: CurrencyCode;
  euroRate: number;
  link?: string;
  reason?: string;
  expectedDeliveryDate?: Date | string;
  toolNumber?: string;
  isEstimate?: boolean;
};
