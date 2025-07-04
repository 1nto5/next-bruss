import * as z from 'zod';

export const OvertimeSubmissionSchema = z
  .object({
    supervisor: z
      .string()
      .email({ message: 'Wybierz kierownika!' })
      .nonempty({ message: 'Kierownik jest wymagany!' }),
    date: z.date({ message: 'Wybierz datę!' }),
    hours: z
      .number()
      .min(-8, { message: 'Podaj wartość z zakresu -8 do 16!' })
      .max(16, { message: 'Podaj wartość z zakresu -8 do 16!' }),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      // Calculate date boundaries
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      // First day of previous month
      const firstDayPrevMonth = new Date(year, month - 1, 1);
      // Last day of next month
      const lastDayNextMonth = new Date(year, month + 2, 0, 23, 59, 59, 999);

      if (data.hours < 0) {
        // Collecting overtime: date >= first day of previous month, date <= last day of next month
        return data.date >= firstDayPrevMonth && data.date <= lastDayNextMonth;
      } else {
        // Adding overtime: date >= first day of previous month, date <= today
        return data.date >= firstDayPrevMonth && data.date <= now;
      }
    },
    {
      message:
        'Data musi być nie starsza niż początek poprzedniego miesiąca i nie późniejsza niż dziś (lub koniec następnego miesiąca przy odbiorze nadgodzin)!',
      path: ['date'],
    },
  )
  .refine(
    (data) => {
      // Check if hours is in 0.5 hour increments
      const isValidIncrement = (data.hours * 2) % 1 === 0;
      return isValidIncrement;
    },
    {
      message:
        'Godziny muszą być wyrażone z dokładnością do pół godziny (0.5, 1.0, 1.5, etc.)',
      path: ['hours'],
    },
  )
  .refine(
    (data) => {
      // If hours is positive or zero, reason must be non-empty
      if (data.hours >= 0) {
        return !!data.reason && data.reason.trim().length > 0;
      }
      // If hours is negative, reason can be empty or omitted
      return true;
    },
    {
      message: 'Uzasadnienie jest wymagane dla dodatnich godzin!',
      path: ['reason'],
    },
  );

export type OvertimeSubmissionType = z.infer<typeof OvertimeSubmissionSchema>;
