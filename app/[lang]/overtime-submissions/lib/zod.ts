import * as z from 'zod';

// ============================================================================
// FACTORY FUNCTIONS FOR TRANSLATED SCHEMAS
// ============================================================================

// Schema for regular overtime entries (past hours)
export const createOvertimeEntrySchema = (validation: {
  supervisorEmailInvalid: string;
  supervisorRequired: string;
  dateRequired: string;
  hoursMinRange: string;
  hoursMaxRange: string;
  dateRangeInvalid: string;
  hoursIncrementInvalid: string;
  reasonRequired: string;
  previousMonthNotAllowed: string;
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
    })
    .refine(
      (data) => {
        if (!data.date) return true;
        const now = new Date();
        const selectedDate = new Date(data.date);

        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth();

        if (
          selectedYear < currentYear ||
          (selectedYear === currentYear && selectedMonth < currentMonth)
        ) {
          return false;
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
        if (!data.date) return true;

        const now = new Date();
        now.setHours(23, 59, 59, 999);

        const threeDaysAgo = new Date();
        threeDaysAgo.setHours(0, 0, 0, 0);
        threeDaysAgo.setDate(now.getDate() - 3);

        const startOfCurrentMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        );
        startOfCurrentMonth.setHours(0, 0, 0, 0);

        if (data.hours < 0) {
          return data.date > now;
        } else {
          const effectiveStartDate =
            threeDaysAgo > startOfCurrentMonth
              ? threeDaysAgo
              : startOfCurrentMonth;
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
    );
};

// Schema for work orders (future overtime)
export const createWorkOrderSchema = (validation: {
  supervisorEmailInvalid: string;
  supervisorRequired: string;
  hoursMinRange: string;
  hoursMaxRange: string;
  hoursIncrementInvalid: string;
  timeIncrementInvalid?: string;
  scheduledDayOffRequired: string;
  workStartTimeRequired?: string;
  workEndTimeRequired?: string;
  workEndTimeBeforeStart?: string;
  durationMax24h?: string;
  durationMin1h?: string;
}) => {
  return z
    .object({
      supervisor: z
        .string()
        .email({ message: validation.supervisorEmailInvalid })
        .nonempty({ message: validation.supervisorRequired }),
      hours: z
        .number()
        .min(0, { message: validation.hoursMinRange })
        .max(16, { message: validation.hoursMaxRange }),
      reason: z.string().optional(),
      payment: z.boolean().optional(),
      scheduledDayOff: z.date().optional(),
      workStartTime: z.date(),
      workEndTime: z.date(),
    })
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
        // workStartTime must be in 30-minute increments
        if (data.workStartTime) {
          const minutes = data.workStartTime.getMinutes();
          return minutes === 0 || minutes === 30;
        }
        return true;
      },
      {
        message:
          validation.timeIncrementInvalid ||
          'Time must be in 30-minute increments (:00 or :30)!',
        path: ['workStartTime'],
      },
    )
    .refine(
      (data) => {
        // workEndTime must be in 30-minute increments
        if (data.workEndTime) {
          const minutes = data.workEndTime.getMinutes();
          return minutes === 0 || minutes === 30;
        }
        return true;
      },
      {
        message:
          validation.timeIncrementInvalid ||
          'Time must be in 30-minute increments (:00 or :30)!',
        path: ['workEndTime'],
      },
    )
    .refine(
      (data) => {
        if (data.workStartTime && data.workEndTime) {
          return data.workEndTime > data.workStartTime;
        }
        return true;
      },
      {
        message:
          validation.workEndTimeBeforeStart ||
          'Work end time must be after work start time!',
        path: ['workEndTime'],
      },
    )
    .refine(
      (data) => {
        if (data.workStartTime && data.workEndTime) {
          const durationMs =
            data.workEndTime.getTime() - data.workStartTime.getTime();
          const durationHours = durationMs / (1000 * 60 * 60);
          return durationHours >= 1;
        }
        return true;
      },
      {
        message:
          validation.durationMin1h || 'Work duration must be at least 1 hour!',
        path: ['workEndTime'],
      },
    )
    .refine(
      (data) => {
        if (data.workStartTime && data.workEndTime) {
          const durationMs =
            data.workEndTime.getTime() - data.workStartTime.getTime();
          const durationHours = durationMs / (1000 * 60 * 60);
          return durationHours <= 24;
        }
        return true;
      },
      {
        message:
          validation.durationMax24h || 'Work duration cannot exceed 24 hours!',
        path: ['workEndTime'],
      },
    )
    .refine(
      (data) => {
        if (!data.payment) {
          return !!data.scheduledDayOff;
        }
        return true;
      },
      {
        message: validation.scheduledDayOffRequired,
        path: ['scheduledDayOff'],
      },
    );
};

// ============================================================================
// CORRECTION SCHEMAS (without date range restrictions)
// ============================================================================

// Schema for correcting regular overtime entries (no date range restrictions)
export const createOvertimeCorrectionSchema = (validation: {
  supervisorEmailInvalid: string;
  supervisorRequired: string;
  dateRequired: string;
  hoursMinRange: string;
  hoursMaxRange: string;
  hoursIncrementInvalid: string;
  reasonRequired: string;
  previousMonthNotAllowed: string;
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
    })
    .refine(
      (data) => {
        if (!data.date) return true;
        const now = new Date();
        const selectedDate = new Date(data.date);

        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth();

        if (
          selectedYear < currentYear ||
          (selectedYear === currentYear && selectedMonth < currentMonth)
        ) {
          return false;
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
    );
};

// Schema for correcting work orders (no date/time range restrictions)
export const createWorkOrderCorrectionSchema = (validation: {
  supervisorEmailInvalid: string;
  supervisorRequired: string;
  hoursMinRange: string;
  hoursMaxRange: string;
  hoursIncrementInvalid: string;
  timeIncrementInvalid?: string;
  scheduledDayOffRequired: string;
  workStartTimeRequired?: string;
  workEndTimeRequired?: string;
  workEndTimeBeforeStart?: string;
  durationMax24h?: string;
  durationMin1h?: string;
}) => {
  return z
    .object({
      supervisor: z
        .string()
        .email({ message: validation.supervisorEmailInvalid })
        .nonempty({ message: validation.supervisorRequired }),
      hours: z
        .number()
        .min(0, { message: validation.hoursMinRange })
        .max(16, { message: validation.hoursMaxRange }),
      reason: z.string().optional(),
      payment: z.boolean().optional(),
      scheduledDayOff: z.date().optional(),
      workStartTime: z.date(),
      workEndTime: z.date(),
    })
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
        // workStartTime must be in 30-minute increments
        if (data.workStartTime) {
          const minutes = data.workStartTime.getMinutes();
          return minutes === 0 || minutes === 30;
        }
        return true;
      },
      {
        message:
          validation.timeIncrementInvalid ||
          'Time must be in 30-minute increments (:00 or :30)!',
        path: ['workStartTime'],
      },
    )
    .refine(
      (data) => {
        // workEndTime must be in 30-minute increments
        if (data.workEndTime) {
          const minutes = data.workEndTime.getMinutes();
          return minutes === 0 || minutes === 30;
        }
        return true;
      },
      {
        message:
          validation.timeIncrementInvalid ||
          'Time must be in 30-minute increments (:00 or :30)!',
        path: ['workEndTime'],
      },
    )
    .refine(
      (data) => {
        if (data.workStartTime && data.workEndTime) {
          return data.workEndTime > data.workStartTime;
        }
        return true;
      },
      {
        message:
          validation.workEndTimeBeforeStart ||
          'Work end time must be after work start time!',
        path: ['workEndTime'],
      },
    )
    .refine(
      (data) => {
        if (data.workStartTime && data.workEndTime) {
          const durationMs =
            data.workEndTime.getTime() - data.workStartTime.getTime();
          const durationHours = durationMs / (1000 * 60 * 60);
          return durationHours >= 1;
        }
        return true;
      },
      {
        message:
          validation.durationMin1h || 'Work duration must be at least 1 hour!',
        path: ['workEndTime'],
      },
    )
    .refine(
      (data) => {
        if (data.workStartTime && data.workEndTime) {
          const durationMs =
            data.workEndTime.getTime() - data.workStartTime.getTime();
          const durationHours = durationMs / (1000 * 60 * 60);
          return durationHours <= 24;
        }
        return true;
      },
      {
        message:
          validation.durationMax24h || 'Work duration cannot exceed 24 hours!',
        path: ['workEndTime'],
      },
    )
    .refine(
      (data) => {
        if (!data.payment) {
          return !!data.scheduledDayOff;
        }
        return true;
      },
      {
        message: validation.scheduledDayOffRequired,
        path: ['scheduledDayOff'],
      },
    );
};

// ============================================================================
// ORIGINAL COMBINED SCHEMA (for backward compatibility with edit flow)
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
  workStartTimeRequired?: string;
  workEndTimeRequired?: string;
  workEndTimeBeforeStart?: string;
  durationMax24h?: string;
  durationMin1h?: string;
}) => {
  return z
    .object({
      supervisor: z
        .string()
        .email({ message: validation.supervisorEmailInvalid })
        .nonempty({ message: validation.supervisorRequired }),
      date: z.date({ message: validation.dateRequired }).optional(),
      hours: z
        .number()
        .min(-8, { message: validation.hoursMinRange })
        .max(16, { message: validation.hoursMaxRange }),
      reason: z.string().optional(),
      overtimeRequest: z.boolean().default(false),
      payment: z.boolean().optional(),
      scheduledDayOff: z.date().optional(),
      workStartTime: z.date().optional(),
      workEndTime: z.date().optional(),
    })
    .refine(
      (data) => {
        // Date is only required for regular overtime (not work orders/overtime requests)
        if (!data.overtimeRequest && !data.date) {
          return false;
        }
        return true;
      },
      {
        message: validation.dateRequired,
        path: ['date'],
      },
    )
    .refine(
      (data) => {
        // Skip date validation for overtime requests
        if (data.overtimeRequest) {
          return true;
        }
        if (!data.date) return true; // Skip if date is not set (will be validated above)
        const now = new Date();
        const selectedDate = new Date(data.date);

        // Check if selected date is from previous month
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth();

        // If year is earlier OR (same year but month is earlier) = previous month
        if (
          selectedYear < currentYear ||
          (selectedYear === currentYear && selectedMonth < currentMonth)
        ) {
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
        // Skip date validation for overtime requests
        if (data.overtimeRequest) {
          return true;
        }
        if (!data.date) {
          return true; // Will be caught by dateRequired validation
        }

        const now = new Date();
        now.setHours(23, 59, 59, 999);

        // Skip date range validation for overtime orders (date is derived from workStartTime)
        if (data.overtimeRequest) {
          return true;
        }

        const threeDaysAgo = new Date();
        threeDaysAgo.setHours(0, 0, 0, 0);
        threeDaysAgo.setDate(now.getDate() - 3);

        const startOfCurrentMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        );
        startOfCurrentMonth.setHours(0, 0, 0, 0);

        if (data.hours < 0) {
          // Overtime pickup: any time after now
          return effectiveDate > now;
        } else {
          // Adding overtime: within last 3 days (+ today = 4 days total) BUT only from current month
          // Effective start date is the later of: (3 days ago) or (start of current month)
          const effectiveStartDate =
            threeDaysAgo > startOfCurrentMonth
              ? threeDaysAgo
              : startOfCurrentMonth;
          return effectiveDate >= effectiveStartDate && effectiveDate <= now;
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
        // For overtime orders, future date validation is handled by workStartTime validation
        if (data.overtimeRequest) {
          // Date is derived from workStartTime in transform, so skip this validation
          return true;
        }
        // Date must be provided when overtimeRequest is false
        if (!data.date) {
          return false;
        }
        const now = new Date();
        return data.date > now;
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
    )
    .refine(
      (data) => {
        // If overtimeRequest is true, workStartTime is required
        if (data.overtimeRequest) {
          return !!data.workStartTime;
        }
        return true;
      },
      {
        message:
          validation.workStartTimeRequired || 'Work start time is required!',
        path: ['workStartTime'],
      },
    )
    .refine(
      (data) => {
        // workStartTime must be in 30-minute increments
        if (data.workStartTime) {
          const minutes = data.workStartTime.getMinutes();
          return minutes === 0 || minutes === 30;
        }
        return true;
      },
      {
        message:
          validation.timeIncrementInvalid ||
          'Time must be in 30-minute increments (:00 or :30)!',
        path: ['workStartTime'],
      },
    )
    .refine(
      (data) => {
        // If overtimeRequest is true, workEndTime is required
        if (data.overtimeRequest) {
          return !!data.workEndTime;
        }
        return true;
      },
      {
        message: validation.workEndTimeRequired || 'Work end time is required!',
        path: ['workEndTime'],
      },
    )
    .refine(
      (data) => {
        // workEndTime must be in 30-minute increments
        if (data.workEndTime) {
          const minutes = data.workEndTime.getMinutes();
          return minutes === 0 || minutes === 30;
        }
        return true;
      },
      {
        message:
          validation.timeIncrementInvalid ||
          'Time must be in 30-minute increments (:00 or :30)!',
        path: ['workEndTime'],
      },
    )
    .refine(
      (data) => {
        // If overtimeRequest is true, workEndTime must be after workStartTime
        if (data.overtimeRequest && data.workStartTime && data.workEndTime) {
          return data.workEndTime > data.workStartTime;
        }
        return true;
      },
      {
        message:
          validation.workEndTimeBeforeStart ||
          'Work end time must be after work start time!',
        path: ['workEndTime'],
      },
    )
    .refine(
      (data) => {
        // Duration must be at least 1 hour
        if (data.overtimeRequest && data.workStartTime && data.workEndTime) {
          const durationMs =
            data.workEndTime.getTime() - data.workStartTime.getTime();
          const durationHours = durationMs / (1000 * 60 * 60);
          return durationHours >= 1;
        }
        return true;
      },
      {
        message:
          validation.durationMin1h || 'Work duration must be at least 1 hour!',
        path: ['workEndTime'],
      },
    )
    .refine(
      (data) => {
        // Duration must not exceed 24 hours
        if (data.overtimeRequest && data.workStartTime && data.workEndTime) {
          const durationMs =
            data.workEndTime.getTime() - data.workStartTime.getTime();
          const durationHours = durationMs / (1000 * 60 * 60);
          return durationHours <= 24;
        }
        return true;
      },
      {
        message:
          validation.durationMax24h || 'Work duration cannot exceed 24 hours!',
        path: ['workEndTime'],
      },
    );
};
