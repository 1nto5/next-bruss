// Invoice (FV - Faktura VAT) Status Flow:
// TO_CONFIRM → CONFIRMED → BOOKED
//      ↓            ↓
//      └─→ MANAGER_REVIEW ─→ CONFIRMED
//      ↓
//   REJECTED (can reopen)

export type InvoiceStatus =
  | 'to-confirm'
  | 'confirmed'
  | 'manager-review'
  | 'booked'
  | 'rejected';

export type InvoiceConfirmationType = 'pr' | 'sc' | 'non-pr';

export type CurrencyCode = 'EUR' | 'GBP' | 'USD' | 'PLN';

export type InvoiceAttachmentType = {
  filename: string;
  originalName: string;
  uploadedAt: Date | string;
  size: number;
};

export type InvoiceLogType = {
  action: string;
  user: string;
  timestamp: Date | string;
  comment?: string;
};

export type InvoiceType = {
  _id: string;
  invoiceNumber: string; // supplier invoice number
  status: InvoiceStatus;

  // Supplier & value
  supplier: string;
  supplierName: string;
  value: number;
  currency: CurrencyCode;

  // Assignment
  sender: string; // who uploaded (bookkeeper)
  senderName?: string;
  receiver: string; // who must confirm
  receiverName?: string;

  // Dates
  invoiceDate?: Date | string; // invoice issue date
  receiveDate?: Date | string; // when received by company
  addedAt: Date | string; // upload timestamp

  // Description
  shortDescription?: string;

  // Confirmation details
  confirmationType?: InvoiceConfirmationType;
  linkedPrId?: string; // if confirmed with PR
  linkedPrNumber?: string;
  linkedScCode?: string; // if confirmed with SC

  // Booking (manual since no BaaN)
  bookingReference?: string; // internal booking number
  bookedBy?: string;
  bookedAt?: Date | string;

  // Rejection
  rejectedBy?: string;
  rejectedAt?: Date | string;
  rejectionReason?: string;

  // Manager review
  managerReviewReason?: string; // why sent to manager
  reviewedBy?: string;
  reviewedAt?: Date | string;

  // File attachment
  attachment?: InvoiceAttachmentType;

  // Audit log
  logs: InvoiceLogType[];
};

// Supplier Code - alternative authorization for non-PR purchases
export type SupplierCodeStatus = 'active' | 'inactive';

export type SupplierCodeType = {
  _id: string;
  code: string; // "SC-001" format
  description: string;
  owner: string; // user email who owns this SC
  ownerName?: string;

  maxValue?: number; // spending limit
  maxCurrency?: CurrencyCode;

  status: SupplierCodeStatus;

  createdAt: Date | string;
  createdBy: string;
  updatedAt?: Date | string;
  updatedBy?: string;
};

// For form creation/editing
export type UploadInvoiceInput = {
  invoiceNumber: string;
  supplier: string;
  supplierName: string;
  value: number;
  currency: CurrencyCode;
  receiver: string;
  invoiceDate?: Date | string;
  receiveDate?: Date | string;
  shortDescription?: string;
  proposedPrNumber?: string; // suggested PR link
};

export type CreateSupplierCodeInput = {
  code: string;
  description: string;
  owner: string;
  maxValue?: number;
  maxCurrency?: CurrencyCode;
};

// For PR lookup during invoice confirmation
export type PRLookupResult = {
  _id: string;
  internalId: string;
  supplier?: string;
  supplierName?: string;
  total: number;
  currency: CurrencyCode;
  status: string;
  requestedBy: string;
  approvedAt?: Date | string;
};
