import * as z from 'zod';

export const addLv2FailureSchema = z.object({
  station: z.string(),
  failure: z.string(),
  from: z.date(),
  to: z.date(),
  supervisor: z.string().min(1),
  responsible: z.string().min(1),
  solution: z.string().min(1),
});

export type AddFailureType = z.infer<typeof addLv2FailureSchema>;
