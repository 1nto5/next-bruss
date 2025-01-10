import * as z from 'zod';

export const AddFailureSchema = z
  .object({
    line: z.string(),
    station: z.string(),
    failure: z.string(),
    from: z.date(),
    supervisor: z.string().min(1),
    responsible: z.string().min(1),
    solution: z.string().optional(),
    comment: z.string().optional(),
  })
  .refine((data) => data.from < new Date(), {
    path: ['from'],
    message: 'Nie planujemy awarii w przyszłości!',
  })
  .refine((data) => data.from >= new Date(Date.now() - 3600 * 1000), {
    path: ['from'],
    message: 'Nie możemy cofnąć się w czasie więcej niż 1h!',
  })
  .refine((data) => data.failure.length > 0, {
    path: ['failure'],
  });

export type FailureZodType = z.infer<typeof AddFailureSchema>;

export const UpdateFailureSchema = z
  .object({
    from: z.date(),
    to: z.date(),
    supervisor: z.string().min(1),
    responsible: z.string().min(1),
    solution: z.string().optional(),
    comment: z.string().optional(),
  })
  .refine((data) => data.from < new Date(), {
    path: ['from'],
    message: 'Data nie może być z przyszłości!',
  })
  .refine((data) => data.to < new Date(), {
    path: ['to'],
    message: 'Data nie może być z przyszłości!',
  })
  .refine((data) => data.to >= data.from, {
    path: ['to'],
    message: 'Zakończenie nie może być wcześniej niż rozpoczęcie!',
  });
