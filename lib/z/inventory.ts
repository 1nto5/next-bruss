import * as z from 'zod';

export const UpdatePositionSchema = z.object({
  articleNumber: z.string(),
  quantity: z.number(),
  unit: z.string(),
  wip: z.boolean(),
  approved: z.boolean().optional(),
  bin: z.string().optional(),
  deliveryDate: z.date().optional(),
  comment: z.string().optional(),
});

export type PositionZodType = z.infer<typeof UpdatePositionSchema>;
