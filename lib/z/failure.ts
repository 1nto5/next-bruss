import * as z from 'zod';

export const Lv2FailureSchema = z.object({
  station: z.string(),
  failure: z.string(),
  from: z.date(),
  to: z.date(),
  supervisor: z.string().min(1),
  responsible: z.string().min(1),
  solution: z.string().min(1),
});

export type FailureType = z.infer<typeof Lv2FailureSchema>;

export type FailureTableDataType = Omit<FailureType, 'from' | 'to'> & {
  from: string;
  to: string;
};
