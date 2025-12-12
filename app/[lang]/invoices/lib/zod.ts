import * as z from 'zod';

// ============================================================================
// CURRENCY OPTIONS
// ============================================================================

export const currencyOptions = ['EUR', 'GBP', 'USD', 'PLN'] as const;

// ============================================================================
// FACTORY FUNCTIONS FOR TRANSLATED SCHEMAS
// ============================================================================

export const createUploadInvoiceSchema = (validation: {
  invoiceNumberRequired: string;
  invoiceNumberMinLength: string;
  supplierRequired: string;
  valueRequired: string;
  valuePositive: string;
  currencyRequired: string;
  receiverRequired: string;
}) => {
  return z.object({
    invoiceNumber: z
      .string({ message: validation.invoiceNumberRequired })
      .min(1, { message: validation.invoiceNumberMinLength }),
    supplier: z.string().min(1, { message: validation.supplierRequired }),
    supplierName: z.string().optional(),
    value: z
      .number({ message: validation.valueRequired })
      .positive({ message: validation.valuePositive }),
    currency: z.enum(currencyOptions, { message: validation.currencyRequired }),
    receiver: z.string().email({ message: validation.receiverRequired }),
    invoiceDate: z.date().optional().or(z.string().optional()),
    receiveDate: z.date().optional().or(z.string().optional()),
    shortDescription: z.string().optional(),
    proposedPrNumber: z.string().optional(),
  });
};

// ============================================================================
// SUPPLIER CODE SCHEMAS
// ============================================================================

export const createSupplierCodeSchema = (validation: {
  codeRequired: string;
  codeFormat: string;
  descriptionRequired: string;
  ownerRequired: string;
}) => {
  return z.object({
    code: z
      .string({ message: validation.codeRequired })
      .regex(/^SC-\d{3,}$/, { message: validation.codeFormat }),
    description: z
      .string({ message: validation.descriptionRequired })
      .min(3),
    owner: z.string().email({ message: validation.ownerRequired }),
    ownerName: z.string().optional(),
    maxValue: z.number().nonnegative().optional(),
    maxCurrency: z.enum(currencyOptions).optional(),
  });
};

// ============================================================================
// ACTION SCHEMAS
// ============================================================================

export const confirmWithPRSchema = z.object({
  invoiceId: z.string(),
  prId: z.string(),
});

export const confirmWithSCSchema = z.object({
  invoiceId: z.string(),
  scCode: z.string(),
});

export const rejectInvoiceSchema = z.object({
  id: z.string(),
  reason: z.string().min(10),
});

export const markBookedSchema = z.object({
  id: z.string(),
  bookingReference: z.string().optional(),
});

export const managerReviewSchema = z.object({
  id: z.string(),
  approved: z.boolean(),
  comment: z.string().optional(),
});
