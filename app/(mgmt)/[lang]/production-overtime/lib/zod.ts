import * as z from 'zod';

export const NewOvertimeRequestSchema = z
  .object({
    numberOfEmployees: z
      .number()
      .min(1, { message: 'Liczba pracowników musi wynosić co najmniej 1!' }),
    employeesWithScheduledDayOff: z
      .array(
        z.object({
          firstName: z.string(),
          lastName: z.string(),
          identifier: z.string(),
          pin: z.string().optional(),
          agreedReceivingAt: z.date({
            message: 'Wybierz datę odbioru dnia wolnego!',
          }),
          note: z.string().optional(),
        }),
      )
      .optional()
      .default([]),
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
  )
  .refine(
    (data) =>
      (data.employeesWithScheduledDayOff?.length || 0) <=
      data.numberOfEmployees,
    {
      message:
        'Liczba pracowników odbierających nie może przekroczyć łącznej liczby pracowników!',
      path: ['employeesWithScheduledDayOff'],
    },
  );

export type NewOvertimeRequestType = z.infer<typeof NewOvertimeRequestSchema>;

export const AttachmentFormSchema = z.object({
  file: z
    .instanceof(File, { message: 'Plik jest wymagany!' })
    .refine((file) => file.size > 0, { message: 'Plik jest pusty!' })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'Plik jest za duży (max 10MB)',
    }),
});

export type AttachmentFormType = z.infer<typeof AttachmentFormSchema>;
