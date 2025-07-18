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
    overtimeRequest: z.boolean().default(false),
    payment: z.boolean().optional(),
    scheduledDayOff: z.date().optional(),
  })
  .refine(
    (data) => {
      // If overtimeRequest is true and payment is false, scheduledDayOff is required
      if (data.overtimeRequest && data.payment === false) {
        return !!data.scheduledDayOff;
      }
      return true;
    },
    {
      message: 'Wybierz dzień odbioru, jeśli nadgodziny nie są do wypłaty!',
      path: ['scheduledDayOff'],
    },
  )
  .refine(
    (data) => {
      const now = new Date();
      // 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setHours(0, 0, 0, 0);
      sevenDaysAgo.setDate(now.getDate() - 7);

      if (data.hours < 0) {
        // Overtime pickup: any time after now (including later today)
        return data.date > now;
      } else {
        // Adding overtime: date >= 7 days ago, date <= today
        return data.date >= sevenDaysAgo && data.date <= now;
      }
    },
    {
      message: 'Możesz dodać nadgodziny tylko z ostatnich 7 dni.',
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
      message: 'Uzasadnienie jest wymagane!',
      path: ['reason'],
    },
  );

export type OvertimeSubmissionType = z.infer<typeof OvertimeSubmissionSchema>;
