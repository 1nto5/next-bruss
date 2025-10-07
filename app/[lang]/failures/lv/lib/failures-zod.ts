import * as z from 'zod';

export const AddFailureSchema = z
  .object({
    line: z.string({ message: 'Wybierz linię aby dodać awarię!' }),
    station: z.string(),
    failure: z.string(),
    from: z.date(),
    supervisor: z.string().min(1, { message: 'Wprowadź nadzorującego!' }),
    responsible: z.string().min(1, { message: 'Wprowadź odpowiedzialnego!' }),
    solution: z.string().optional(),
    comment: z.string().optional(),
  })
  .refine((data) => data.from < new Date(), {
    path: ['from'],
    message: 'Nie planujemy awarii w przyszłości!',
  })
  .refine((data) => data.from >= new Date(Date.now() - 3600 * 1000), {
    path: ['from'],
    message: 'Nie możemy cofnąć się w czasie > 1h!',
  })
  .refine((data) => !!data.station, {
    path: ['station'],
    message: 'Wybierz stację!',
  })
  .refine((data) => !!data.failure && data.station, {
    path: ['failure'],
    message: 'Wybierz awarię!',
  });

export type FailureZodType = z.infer<typeof AddFailureSchema>;

export const UpdateFailureSchema = z
  .object({
    from: z.date(),
    to: z.date(),
    supervisor: z.string().min(1, { message: 'Wprowadź osobę nadzorującą!' }),
    responsible: z
      .string()
      .min(1, { message: 'Wprowadź osobę odpowiedzialną!' }),
    solution: z.string().optional(),
    comment: z.string().optional(),
  })
  .refine((data) => data.from >= new Date(Date.now() - 8 * 3600 * 1000), {
    path: ['from'],
    message: 'Możliwość edycji tylko 8h wstecz!',
  })
  .refine((data) => data.to < new Date(), {
    path: ['to'],
    message: 'Data nie może być z przyszłości!',
  })
  .refine((data) => data.to >= data.from, {
    path: ['to'],
    message: 'Zakończenie nie może być wcześniej niż rozpoczęcie!',
  });
