import * as z from 'zod';

export const AddFailureSchema = z
  .object({
    line: z.string(),
    station: z.string(),
    failure: z.string(),
    from: z.date(),
    // to: z.date(),
    supervisor: z.string().min(1),
    responsible: z.string().min(1),
    solution: z.string().optional(),
    comment: z.string().optional(),
  })
  // .refine((data) => data.from < data.to, {
  //   path: ['to'],
  // })
  // data nie moe być z przyszłości
  .refine((data) => data.from < new Date(), {
    path: ['from'],
    message: 'Data nie może być z przyszłości!',
  })
  .refine((data) => data.failure.length > 0, {
    path: ['failure'],
  });

export type FailureZodType = z.infer<typeof AddFailureSchema>;

export const UpdateFailureSchema = z
  .object({
    from: z.date(),
    to: z.date().optional(),
    supervisor: z.string().min(1),
    responsible: z.string().min(1),
    solution: z.string().optional(),
    comment: z.string().optional(),
  })
  .refine((data) => data.from < new Date(), {
    path: ['from'],
    message: 'Data nie może być z przyszłości!',
  });
