import { position } from 'html2canvas/dist/types/css/property-descriptors/position';
import * as z from 'zod';

export const UpdatePositionSchema = z.object({
  articleNumber: z.string(),
  articleName: z.string(),
  quantity: z.number(),
  wip: z.boolean(),
  comment: z.string().optional(),
});

export type PositionZodType = z.infer<typeof UpdatePositionSchema>;
