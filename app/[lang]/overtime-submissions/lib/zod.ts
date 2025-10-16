import * as z from 'zod';

// ============================================================================
// FACTORY FUNCTIONS FOR TRANSLATED SCHEMAS
// ============================================================================

export const createOvertimeSubmissionSchema = (validation: {
  supervisorEmailInvalid: string;
  supervisorRequired: string;
  dateRequired: string;
  hoursMinRange: string;
  hoursMaxRange: string;
  scheduledDayOffRequired: string;
  dateRangeInvalid: string;
  hoursIncrementInvalid: string;
  reasonRequired: string;
  previousMonthNotAllowed: string;
  overtimeRequestRequiresFutureDate: string;
  overtimeRequestRequiresPositiveHours: string;
}) => {
  return z
    .object({
      supervisor: z
        .string()
        .email({ message: validation.supervisorEmailInvalid })
        .nonempty({ message: validation.supervisorRequired }),
      date: z.date({ message: validation.dateRequired }),
      hours: z
        .number()
        .min(-8, { message: validation.hoursMinRange })
        .max(16, { message: validation.hoursMaxRange }),
      reason: z.string().optional(),
      overtimeRequest: z.boolean().default(false),
      payment: z.boolean().optional(),
      scheduledDayOff: z.date().optional(),
    })
    .refine(
      (data) => {
        if (data.overtimeRequest && data.payment === false) {
          return !!data.scheduledDayOff;
        }
        return true;
      },
      {
        message: validation.scheduledDayOffRequired,
        path: ['scheduledDayOff'],
      },
    )
    .refine(
      (data) => {
        const now = new Date();
        const selectedDate = new Date(data.date);

        // Check if selected date is from previous month
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth();

        // If year is earlier OR (same year but month is earlier) = previous month
        if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
          return false; // Cannot add overtime from previous month
        }

        return true;
      },
      {
        message: validation.previousMonthNotAllowed,
        path: ['date'],
      },
    )
    .refine(
      (data) => {
        const now = new Date();
        now.setHours(23, 59, 59, 999);

        const threeDaysAgo = new Date();
        threeDaysAgo.setHours(0, 0, 0, 0);
        threeDaysAgo.setDate(now.getDate() - 3);

        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfCurrentMonth.setHours(0, 0, 0, 0);

        if (data.hours < 0) {
          // Overtime pickup: any time after now
          return data.date > now;
        } else {
          // Adding overtime: within last 3 days (+ today = 4 days total) BUT only from current month
          // Effective start date is the later of: (3 days ago) or (start of current month)
          const effectiveStartDate = threeDaysAgo > startOfCurrentMonth ? threeDaysAgo : startOfCurrentMonth;
          return data.date >= effectiveStartDate && data.date <= now;
        }
      },
      {
        message: validation.dateRangeInvalid,
        path: ['date'],
      },
    )
    .refine(
      (data) => {
        const isValidIncrement = (data.hours * 2) % 1 === 0;
        return isValidIncrement;
      },
      {
        message: validation.hoursIncrementInvalid,
        path: ['hours'],
      },
    )
    .refine(
      (data) => {
        if (data.hours >= 0) {
          return !!data.reason && data.reason.trim().length > 0;
        }
        return true;
      },
      {
        message: validation.reasonRequired,
        path: ['reason'],
      },
    )
    .refine(
      (data) => {
        // If overtimeRequest is true, date must be in the future
        if (data.overtimeRequest) {
          const now = new Date();
          return data.date > now;
        }
        return true;
      },
      {
        message: validation.overtimeRequestRequiresFutureDate,
        path: ['overtimeRequest'],
      },
    )
    .refine(
      (data) => {
        // If overtimeRequest is true, hours must be positive (not for overtime pickup)
        if (data.overtimeRequest) {
          return data.hours >= 0;
        }
        return true;
      },
      {
        message: validation.overtimeRequestRequiresPositiveHours,
        path: ['overtimeRequest'],
      },
    );
};

// ============================================================================
// OLD SCHEMAS (for backward compatibility)
// ============================================================================

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
      now.setHours(23, 59, 59, 999);

      // 3 days ago (+ today = 4 days total)
      const threeDaysAgo = new Date();
      threeDaysAgo.setHours(0, 0, 0, 0);
      threeDaysAgo.setDate(now.getDate() - 3);

      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfCurrentMonth.setHours(0, 0, 0, 0);

      if (data.hours < 0) {
        // Overtime pickup: any time after now (including later today)
        return data.date > now;
      } else {
        // Adding overtime: within last 3 days (+ today = 4 days total) BUT only from current month
        // Effective start date is the later of: (3 days ago) or (start of current month)
        const effectiveStartDate = threeDaysAgo > startOfCurrentMonth ? threeDaysAgo : startOfCurrentMonth;
        return data.date >= effectiveStartDate && data.date <= now;
      }
    },
    {
      message: 'Możesz dodać nadgodziny tylko z ostatnich 3 dni bieżącego miesiąca.',
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
        'Godziny muszą być wyrażone z dokładnością do pół godziny (0.5, 1.0, 1.5, itd.)',
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
