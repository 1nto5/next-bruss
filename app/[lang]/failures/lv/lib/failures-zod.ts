import * as z from 'zod';

// ============================================================================
// FACTORY FUNCTIONS FOR TRANSLATED SCHEMAS
// ============================================================================

export const createAddFailureSchema = (validation: {
  lineRequired: string;
  supervisorRequired: string;
  responsibleRequired: string;
  stationRequired: string;
  failureRequired: string;
  fromDateFuture: string;
  fromDatePast: string;
}) => {
  return z
    .object({
      line: z.string({ message: validation.lineRequired }),
      station: z.string(),
      failure: z.string(),
      from: z.date(),
      supervisor: z.string().min(1, { message: validation.supervisorRequired }),
      responsible: z.string().min(1, { message: validation.responsibleRequired }),
      solution: z.string().optional(),
      comment: z.string().optional(),
    })
    .refine((data) => data.from < new Date(), {
      path: ['from'],
      message: validation.fromDateFuture,
    })
    .refine((data) => data.from >= new Date(Date.now() - 3600 * 1000), {
      path: ['from'],
      message: validation.fromDatePast,
    })
    .refine((data) => !!data.station, {
      path: ['station'],
      message: validation.stationRequired,
    })
    .refine((data) => !!data.failure && data.station, {
      path: ['failure'],
      message: validation.failureRequired,
    });
};

export const createUpdateFailureSchema = (validation: {
  supervisorRequired: string;
  responsibleRequired: string;
  fromDateEditLimit: string;
  toDateFuture: string;
  toDateBeforeFrom: string;
}) => {
  return z
    .object({
      from: z.date(),
      to: z.date(),
      supervisor: z.string().min(1, { message: validation.supervisorRequired }),
      responsible: z
        .string()
        .min(1, { message: validation.responsibleRequired }),
      solution: z.string().optional(),
      comment: z.string().optional(),
    })
    .refine((data) => data.from >= new Date(Date.now() - 8 * 3600 * 1000), {
      path: ['from'],
      message: validation.fromDateEditLimit,
    })
    .refine((data) => data.to < new Date(), {
      path: ['to'],
      message: validation.toDateFuture,
    })
    .refine((data) => data.to >= data.from, {
      path: ['to'],
      message: validation.toDateBeforeFrom,
    });
};

// ============================================================================
// OLD SCHEMAS (for backward compatibility)
// ============================================================================

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
