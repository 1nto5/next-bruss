import * as z from 'zod';

export const loginSchema = z
  .object({
    personalNumber1: z
      .string()
      .min(1, { message: 'Wprowadź numer personalny!' }),
    personalNumber2: z
      .string()
      .min(1, { message: 'Wprowadź numer personalny!' })
      .optional(),
    personalNumber3: z
      .string()
      .min(1, { message: 'Wprowadź numer personalny!' })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const { personalNumber1, personalNumber2, personalNumber3 } = data;
    if (personalNumber2) {
      if (personalNumber1 === personalNumber2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same nr personalne!',
          path: ['personalNumber2'], // Error assigned to personalNumber2
        });
      }
    }
    if (personalNumber3) {
      if (personalNumber1 === personalNumber3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same nr personalne!',
          path: ['personalNumber3'], // Error assigned to personalNumber3
        });
      }
      if (personalNumber2 === personalNumber3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwo takie same nr personalne!',
          path: ['personalNumber3'], // Error assigned to personalNumber3
        });
      }
    }
  });

export type loginType = z.infer<typeof loginSchema>;
