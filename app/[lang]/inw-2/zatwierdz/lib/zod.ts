import * as z from 'zod';

// ============================================================================
// FACTORY FUNCTIONS FOR TRANSLATED SCHEMAS
// ============================================================================

export const createUpdatePositionSchema = (validation: {
  quantityMustBeNumber: string;
  quantityCannotBeNegative: string;
}) => {
  return z.object({
    articleNumber: z.string(),
    quantity: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'number' ? val : Number(val)))
      .pipe(
        z.number().min(0, {
          message: validation.quantityCannotBeNegative,
        }),
      ),
    unit: z.string(),
    wip: z.boolean(),
    approved: z.boolean().optional(),
    bin: z.string().optional(),
    deliveryDate: z.date().optional(),
    comment: z.string().optional(),
  });
};

// ============================================================================
// OLD SCHEMAS (for backward compatibility)
// ============================================================================

export const UpdatePositionSchema = z.object({
  articleNumber: z.string(),
  quantity: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'number' ? val : Number(val)))
    .pipe(
      z.number().min(0, {
        message: 'Ilość nie może być ujemna',
      }),
    ),
  unit: z.string(),
  wip: z.boolean(),
  approved: z.boolean().optional(),
  bin: z.string().optional(),
  deliveryDate: z.date().optional(),
  comment: z.string().optional(),
});

export type PositionZodType = z.infer<typeof UpdatePositionSchema>;
