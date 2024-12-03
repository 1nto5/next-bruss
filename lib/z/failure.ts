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
    // message: 'Data rozpoczęcia musi być wcześniejsza niż data zakończenia',
    path: ['to'],
  });

export type AddFailureType = z.infer<typeof AddFailureSchema>;

export type FailureType = Omit<AddFailureType, 'from' | 'to'> & {
  from: string | Date;
  to: string | Date;
  createdAt: string | Date;
};
