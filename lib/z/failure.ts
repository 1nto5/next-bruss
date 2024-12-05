import * as z from 'zod';

export const AddFailureSchema = z
  .object({
    line: z.string(),
    station: z.string(),
    failure: z.string(),
    from: z.date(),
    to: z.date(),
    supervisor: z.string().min(1),
    responsible: z.string().min(1),
    solution: z.string().optional(),
  })
  .refine((data) => data.from < data.to, {
    path: ['to'],
  })
  .refine((data) => data.failure.length > 0, {
    path: ['failure'],
  });

export type InsertFailureType = z.infer<typeof AddFailureSchema>;

export type UpdateFailureType = InsertFailureType & {
  _id: string;
};

// export type FailureType = Omit<InsertFailureType, 'from' | 'to'> & {
//   fromLocaleString: string;
//   toLocaleString: string;
//   createdAt: string | Date;
//   duration: number;
// };

export type FailureType = InsertFailureType & {
  _id: string;
  fromLocaleString: string;
  toLocaleString: string;
  createdAt: string | Date;
  duration: number;
};
