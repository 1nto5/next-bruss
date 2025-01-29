import * as z from 'zod';

export const ovenLoginSchema = z
  .object({
    operator1Code: z.string().min(1, { message: 'Wprowadź numer personalny!' }),
    operator2Code: z
      .string()
      .min(1, { message: 'Wprowadź numer personalny!' })
      .optional(),
    operator3Code: z
      .string()
      .min(1, { message: 'Wprowadź numer personalny!' })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const { operator1Code, operator2Code, operator3Code } = data;
    if (operator2Code) {
      if (operator1Code === operator2Code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same nr personalne!',
          path: ['operator2Code'], // Error assigned to operator2Code
        });
      }
    }
    if (operator3Code) {
      if (operator1Code === operator3Code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same nr personalne!',
          path: ['operator3Code'], // Error assigned to operator3Code
        });
      }
      if (operator1Code === operator3Code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same nr personalne!',
          path: ['operator3Code'], // Error assigned to operator3Code
        });
      }
    }
    if (operator2Code && operator3Code) {
      if (operator2Code === operator3Code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same nr personalne!',
          path: ['operator3Code'], // Error assigned to operator3Code
        });
      }
    }
  });

export type ovenLoginType = z.infer<typeof ovenLoginSchema>;

export const newCardSchema = z.object({
  warehouse: z.string().min(1, { message: 'Wybierz magazyn!' }),
  sector: z.string().min(1, { message: 'Wybierz sektor' }),
});

export const positionEditSchema = z.object({
  findArticle: z.string().optional(),
  article: z.string().min(1, { message: 'Wybierz artykuł!' }),
  quantity: z
    .string()
    .min(1, { message: 'Wprowadź ilość!' })
    .refine(
      (value) => {
        return /^\d+(\.\d{1,})?$/.test(value);
      },
      {
        message: 'Wprowadź poprawną wartość używając "." zamiast ","!',
      },
    ),
  wip: z.boolean(),
  unit: z.string().min(1, { message: 'Wybierz jednostkę!' }).optional(),
});
