import * as z from 'zod';

export const inventoryLoginSchema = z
  .object({
    personalNumber1: z
      .string()
      .min(1, { message: 'Wprowadź numer personalny!' }),
    pin1: z.string().min(4, { message: 'Wprowadź PIN złożony z 4 cyfr!' }),
    personalNumber2: z
      .string()
      .min(1, { message: 'Wprowadź numer personalny!' })
      .optional(),
    pin2: z
      .string()
      .min(4, { message: 'Wprowadź PIN złożony z 4 cyfr!' })
      .optional(),
    personalNumber3: z
      .string()
      .min(1, { message: 'Wprowadź numer personalny!' })
      .optional(),
    pin3: z
      .string()
      .min(4, { message: 'Wprowadź PIN złożony z 4 cyfr!' })
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
      if (personalNumber1 === personalNumber3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same nr personalne!',
          path: ['personalNumber3'], // Error assigned to personalNumber3
        });
      }
    }
    if (personalNumber2 && personalNumber3) {
      if (personalNumber2 === personalNumber3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same nr personalne!',
          path: ['personalNumber3'], // Error assigned to personalNumber3
        });
      }
    }
  });

export type loginInventoryType = z.infer<typeof inventoryLoginSchema>;

export const newCardSchema = z.object({
  warehouse: z.string().min(1, { message: 'Wybierz magazyn!' }),
  sector: z.string().min(1, { message: 'Wybierz sektor' }),
});

export const positionEditSchema = z.object({
  findArticle: z.string().optional(),
  article: z.string().min(1, { message: 'Wybierz artykułu!' }),
  quantity: z.number().min(1, { message: 'Wprowadź ilość!' }),
  wip: z.boolean(),
});
