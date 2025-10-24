import * as z from 'zod';

const ArticleQuantitySchema = z.object({
  articleNumber: z
    .string()
    .nonempty({ message: 'Numer artykułu jest wymagany!' }),
  quantity: z
    .number()
    .int({ message: 'Ilość musi być liczbą całkowitą!' })
    .min(1, { message: 'Ilość musi być większa od 0!' }),
});

export function createNewOvertimeRequestSchema(validation: {
  numberOfEmployeesMin: string;
  numberOfShiftsMin: string;
  responsibleEmailInvalid: string;
  responsibleRequired: string;
  dayOffDateRequired: string;
  fromDateRequired: string;
  toDateRequired: string;
  reasonRequired: string;
  fromDateInPast: string;
  toDateInPast: string;
  toDateBeforeFrom: string;
  durationMax24h: string;
  durationMin1h: string;
  employeesExceedsTotal: string;
  durationNotWholeOrHalf: string;
}) {
  return z
    .object({
      department: z.string().nonempty({
        message: 'Wybierz dział!',
      }),
      numberOfEmployees: z
        .union([z.number(), z.string()])
        .transform((val) =>
          val === '' ? 1 : typeof val === 'string' ? parseInt(val) || 1 : val,
        )
        .pipe(
          z
            .number()
            .min(1, {
              message: validation.numberOfEmployeesMin,
            }),
        ),
      numberOfShifts: z
        .union([z.number(), z.string()])
        .transform((val) =>
          val === '' ? 1 : typeof val === 'string' ? parseInt(val) || 1 : val,
        )
        .pipe(
          z
            .number()
            .min(1, { message: validation.numberOfShiftsMin }),
        ),
      responsibleEmployee: z
        .string()
        .email({ message: validation.responsibleEmailInvalid })
        .nonempty({ message: validation.responsibleRequired }),
      employeesWithScheduledDayOff: z
        .array(
          z.object({
            firstName: z.string(),
            lastName: z.string(),
            identifier: z.string(),
            pin: z.string().optional(),
            agreedReceivingAt: z.date({
              message: validation.dayOffDateRequired,
            }),
            note: z.string().optional(),
          }),
        )
        .optional()
        .default([]),
      from: z.date({ message: validation.fromDateRequired }),
      to: z.date({ message: validation.toDateRequired }),
      reason: z.string().nonempty({ message: validation.reasonRequired }),
      note: z.string().optional(),
      // New field for multiple articles
      plannedArticles: z.array(ArticleQuantitySchema).optional().default([]),
    })
    .refine((data) => data.from >= new Date(), {
      message: validation.fromDateInPast,
      path: ['from'],
    })
    .refine((data) => data.to >= new Date(), {
      message: validation.toDateInPast,
      path: ['to'],
    })
    .refine((data) => data.to >= data.from, {
      message: validation.toDateBeforeFrom,
      path: ['to'],
    })
    .refine(
      (data) => {
        const durationMs = data.to.getTime() - data.from.getTime();
        // Round to seconds to avoid millisecond precision issues
        const durationSeconds = Math.floor(durationMs / 1000);
        const maxDurationSeconds = 24 * 60 * 60; // Exactly 24 hours in seconds
        // Allow up to and including exactly 24 hours, but not more
        return durationSeconds <= maxDurationSeconds;
      },
      { message: validation.durationMax24h, path: ['to'] },
    )
    .refine(
      (data) => data.to.getTime() - data.from.getTime() >= 1 * 60 * 60 * 1000,
      {
        message: validation.durationMin1h,
        path: ['to'],
      },
    )
    .refine(
      (data) =>
        (data.employeesWithScheduledDayOff?.length || 0) <=
        data.numberOfEmployees,
      {
        message: validation.employeesExceedsTotal,
        path: ['employeesWithScheduledDayOff'],
      },
    )
    .refine(
      (data) => {
        // Calculate duration in hours
        const durationMs = data.to.getTime() - data.from.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        // Check if it's a whole number or has .5 decimal
        const isWholeOrHalf = durationHours % 0.5 === 0;

        return isWholeOrHalf;
      },
      {
        message: validation.durationNotWholeOrHalf,
        path: ['to'], // Show error on the 'to' field
      },
    );
}

export const NewOvertimeRequestSchema = z
  .object({
    department: z.string().nonempty({
      message: 'Wybierz dział!',
    }),
    numberOfEmployees: z
      .union([z.number(), z.string()])
      .transform((val) =>
        val === '' ? 1 : typeof val === 'string' ? parseInt(val) || 1 : val,
      )
      .pipe(
        z
          .number()
          .min(1, {
            message: 'Liczba pracowników musi wynosić co najmniej 1!',
          }),
      ),
    numberOfShifts: z
      .union([z.number(), z.string()])
      .transform((val) =>
        val === '' ? 1 : typeof val === 'string' ? parseInt(val) || 1 : val,
      )
      .pipe(
        z
          .number()
          .min(1, { message: 'Liczba zmian musi wynosić co najmniej 1!' }),
      ),
    responsibleEmployee: z
      .string()
      .email({ message: 'Wybierz odpowiedzialną osobę!' })
      .nonempty({ message: 'Odpowiedzialna osoba jest wymagana!' }),
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
    // New field for multiple articles
    plannedArticles: z.array(ArticleQuantitySchema).optional().default([]),
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
    (data) => {
      const durationMs = data.to.getTime() - data.from.getTime();
      // Round to seconds to avoid millisecond precision issues
      const durationSeconds = Math.floor(durationMs / 1000);
      const maxDurationSeconds = 24 * 60 * 60; // Exactly 24 hours in seconds
      // Allow up to and including exactly 24 hours, but not more
      return durationSeconds <= maxDurationSeconds;
    },
    { message: 'Czas nie może przekraczać 24h (3 zmiany)!', path: ['to'] },
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
  )
  .refine(
    (data) => {
      // Calculate duration in hours
      const durationMs = data.to.getTime() - data.from.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      // Check if it's a whole number or has .5 decimal
      const isWholeOrHalf = durationHours % 0.5 === 0;

      return isWholeOrHalf;
    },
    {
      message:
        'Czas pracy musi być wyrażony w pełnych godzinach lub z dokładnością do pół godziny',
      path: ['to'], // Show error on the 'to' field
    },
  );

export type NewOvertimeRequestType = z.infer<typeof NewOvertimeRequestSchema>;

// Schema for completion/attendance upload with new fields
export const AttendanceCompletionSchema = z.object({
  actualArticles: z.array(ArticleQuantitySchema).optional().default([]),
  actualEmployeesWorked: z
    .number({ required_error: 'Liczba pracowników jest wymagana!' })
    .int({ message: 'Liczba pracowników musi być liczbą całkowitą!' })
    .min(0, { message: 'Liczba pracowników nie może być ujemna!' }),
});

export type AttendanceCompletionType = z.infer<
  typeof AttendanceCompletionSchema
>;

export const AttachmentFormSchema = z.object({
  file: z
    .instanceof(File, { message: 'Plik jest wymagany!' })
    .refine((file) => file.size > 0, { message: 'Plik jest pusty!' })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'Plik jest za duży (max 10MB)',
    }),
});

export type AttachmentFormType = z.infer<typeof AttachmentFormSchema>;

export const MultipleAttachmentFormSchema = z.object({
  files: z
    .array(
      z
        .instanceof(File, { message: 'Nieprawidłowy plik!' })
        .refine((file) => file.size > 0, { message: 'Plik jest pusty!' })
        .refine((file) => file.size <= 10 * 1024 * 1024, {
          message: 'Plik jest za duży (max 10MB)',
        }),
    )
    .min(1, { message: 'Wybierz co najmniej jeden plik!' })
    .max(10, { message: 'Możesz przesłać maksymalnie 10 plików!' })
    .refine(
      (files) => {
        const totalSize = files.reduce((acc, file) => acc + file.size, 0);
        return totalSize <= 50 * 1024 * 1024; // 50MB total limit
      },
      { message: 'Łączny rozmiar plików przekracza 50MB!' },
    ),
  mergeFiles: z.boolean().default(true),
  actualArticles: z.array(ArticleQuantitySchema).optional().default([]),
  actualEmployeesWorked: z
    .number({ required_error: 'Liczba pracowników jest wymagana!' })
    .int({ message: 'Liczba pracowników musi być liczbą całkowitą!' })
    .min(0, { message: 'Liczba pracowników nie może być ujemna!' }),
});

export type MultipleAttachmentFormType = z.infer<
  typeof MultipleAttachmentFormSchema
>;
