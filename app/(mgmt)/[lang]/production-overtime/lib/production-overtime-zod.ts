import * as z from 'zod';

export const NewOvertimeRequestSchema = z
  .object({
    selectedEmployees: z
      .array(
        z.object({
          firstName: z.string(),
          lastName: z.string(),
          identifier: z.string(),
          pin: z.string().optional(),
          agreedReceivingAt: z.date().optional(),
          note: z.string().optional(),
        }),
      )
      .nonempty({ message: 'Nie wybrano żadnego pracownika!' }),
    from: z.date({ message: 'Wybierz datę rozpoczęcia!' }),
    to: z.date({ message: 'Wybierz datę zakończenia!' }),
    reason: z.string().nonempty({ message: 'Nie wprowadzono uzasadnienia!' }),
    note: z.string().optional(),
  })
  .refine((data) => data.from >= new Date(), {
    message: 'Rozpoczęcie nie może być w przeszłości!',
    path: ['from'],
  })
  .refine((data) => data.to >= new Date(), {
    message: 'Zakończenie nie może być w przeszłości!',
    path: ['to'],
  })
  .refine((data) => data.to >= data.from, {
    message: 'Zakończenie nie może być przed rozpoczęciem!',
    path: ['to'],
  })
  .refine(
    (data) => data.to.getTime() - data.from.getTime() <= 8 * 60 * 60 * 1000,
    { message: 'Przepracowany czas nie może przekraczać 8h!', path: ['to'] },
  )
  .refine(
    (data) => data.to.getTime() - data.from.getTime() >= 1 * 60 * 60 * 1000,
    {
      message: 'Zlecany czas pracy musi wynosić co najmniej 1h!',
      path: ['to'],
    },
  );

export type NewOvertimeRequestType = z.infer<typeof NewOvertimeRequestSchema>;
