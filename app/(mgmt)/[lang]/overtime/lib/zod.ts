import * as z from 'zod';

export const OvertimeHoursSubmissionSchema = z
  .object({
    supervisor: z
      .string()
      .email({ message: 'Wybierz kierownika!' })
      .nonempty({ message: 'Kierownik jest wymagany!' }),
    workedDate: z.date({ message: 'Wybierz datę wykonanej pracy!' }),
    hoursWorked: z
      .number()
      .min(0.5, { message: 'Minimalna liczba godzin to 0.5!' })
      .max(16, { message: 'Maksymalna liczba godzin to 16!' }),
    reason: z.string().nonempty({ message: 'Nie wprowadzono uzasadnienia!' }),
    description: z.string().optional(),
    note: z.string().optional(),
  })
  .refine((data) => data.workedDate <= new Date(), {
    message: 'Data pracy nie może być w przyszłości!',
    path: ['workedDate'],
  })
  .refine(
    (data) => {
      // Check if hours worked is in 0.5 hour increments
      const isValidIncrement = (data.hoursWorked * 2) % 1 === 0;
      return isValidIncrement;
    },
    {
      message:
        'Czas pracy musi być wyrażony z dokładnością do pół godziny (0.5, 1.0, 1.5, etc.)',
      path: ['hoursWorked'],
    },
  );

export type OvertimeHoursSubmissionType = z.infer<
  typeof OvertimeHoursSubmissionSchema
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
