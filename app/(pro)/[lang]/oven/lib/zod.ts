import * as z from 'zod';

export const loginSchema = z
  .object({
    identifier1: z.string().min(1, { message: 'Wprowadź numer personalny!' }),
    identifier2: z
      .string()
      .min(1, { message: 'Wprowadź numer personalny!' })
      .optional(),
    identifier3: z
      .string()
      .min(1, { message: 'Wprowadź numer personalny!' })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const { identifier1, identifier2, identifier3 } = data;
    if (identifier2) {
      if (identifier1 === identifier2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same numery personalne!',
          path: ['identifier2'],
        });
      }
    }
    if (identifier3) {
      if (identifier1 === identifier3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same numery personalne!',
          path: ['identifier3'],
        });
      }
      if (identifier2 === identifier3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same numery personalne!',
          path: ['identifier3'],
        });
      }
    }
  });

export type loginType = z.infer<typeof loginSchema>;

export const startOvenProcessSchema = z.object({
  article: z.string().min(1, { message: 'Wprowadź numer artykułu!' }),
  hydraBatch: z.string().min(1, { message: 'Wprowadź numer HYDRA batch!' }),
  operator: z.array(z.string().min(1)).min(1),
});

export type StartOvenProcessType = z.infer<typeof startOvenProcessSchema>;
