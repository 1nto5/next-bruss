import * as z from 'zod';

export const AddFailureSchema = z
  .object({
    station: z.string(),
    failure: z.string(),
    from: z.date(),
    to: z.date(),
    supervisor: z.string().min(1),
    responsible: z.string().min(1),
    solution: z.string().optional(),
  })
  .refine((data) => data.from < data.to, {
    path: ['to'],
  })
  .refine((data) => data.failure.length > 0, {
    path: ['failure'],
  });

export type AddFailureType = z.infer<typeof AddFailureSchema>;

export type FailureType = Omit<AddFailureType, 'from' | 'to'> & {
  from: string | Date;
  to: string | Date;
  createdAt: string | Date;
};
