import * as z from 'zod';

// ============================================================================
// CURRENCY OPTIONS
// ============================================================================

export const currencyOptions = ['EUR', 'GBP', 'USD', 'PLN'] as const;

// ============================================================================
// FACTORY FUNCTIONS FOR TRANSLATED SCHEMAS
// ============================================================================

export const createPurchaseRequestSchema = (validation: {
  managerRequired: string;
  currencyRequired: string;
  itemsRequired: string;
  itemsMinLength: string;
}) => {
  return z.object({
    supplier: z.string().optional(),
    supplierName: z.string().optional(),
    currency: z.enum(currencyOptions, { message: validation.currencyRequired }),
    manager: z.string().min(1, { message: validation.managerRequired }),
    items: z
      .array(purchaseRequestItemSchema)
      .min(1, { message: validation.itemsMinLength }),
  });
};

export const purchaseRequestItemSchema = z.object({
  article: z.string().optional(),
  supplier: z.string().optional(),
  description: z.string().min(3),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  currency: z.enum(currencyOptions),
  euroRate: z.number().positive(),
  link: z.string().url().optional().or(z.literal('')),
  reason: z.string().optional(),
  expectedDeliveryDate: z.date().optional().or(z.string().optional()),
  toolNumber: z.string().optional(),
  isEstimate: z.boolean().optional(),
});

export const createPurchaseRequestItemSchema = (validation: {
  descriptionRequired: string;
  descriptionMinLength: string;
  quantityRequired: string;
  quantityPositive: string;
  unitPriceRequired: string;
  unitPriceNonNegative: string;
  currencyRequired: string;
}) => {
  return z.object({
    article: z.string().optional(),
    supplier: z.string().optional(),
    description: z
      .string({ message: validation.descriptionRequired })
      .min(3, { message: validation.descriptionMinLength }),
    quantity: z
      .number({ message: validation.quantityRequired })
      .positive({ message: validation.quantityPositive }),
    unitPrice: z
      .number({ message: validation.unitPriceRequired })
      .nonnegative({ message: validation.unitPriceNonNegative }),
    currency: z.enum(currencyOptions, { message: validation.currencyRequired }),
    euroRate: z.number().positive().default(1),
    link: z.string().url().optional().or(z.literal('')),
    reason: z.string().optional(),
    expectedDeliveryDate: z.date().optional().or(z.string().optional()),
    toolNumber: z.string().optional(),
    isEstimate: z.boolean().optional().default(false),
  });
};

// ============================================================================
// APPROVER SCHEMAS
// ============================================================================

export const createApproverSchema = (validation: {
  userIdRequired: string;
}) => {
  return z.object({
    userId: z.string().email({ message: validation.userIdRequired }),
    userName: z.string().optional(),
    isFinalApprover: z.boolean().default(false),
    limits: z.object({
      perUnit: z.number().nonnegative().optional(),
      daily: z.number().nonnegative().optional(),
      weekly: z.number().nonnegative().optional(),
      monthly: z.number().nonnegative().optional(),
      yearly: z.number().nonnegative().optional(),
    }),
  });
};

// ============================================================================
// ACTION SCHEMAS
// ============================================================================

export const approvalSchema = z.object({
  id: z.string(),
  comment: z.string().optional(),
});

export const rejectionSchema = z.object({
  id: z.string(),
  reason: z.string().min(10),
});

export const markOrderedSchema = z.object({
  id: z.string(),
  orderNumber: z.string().optional(),
});

export const markItemReceivedSchema = z.object({
  itemId: z.string(),
  quantity: z.number().positive().optional(),
});

export const addCommentSchema = z.object({
  id: z.string(),
  content: z.string().min(1),
});
