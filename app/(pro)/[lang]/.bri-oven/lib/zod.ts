import * as z from 'zod';

export const ovenLoginSchema = z
  .object({
    operator1Code: z
      .string()
      .min(1, { message: 'Bitte geben Sie den Mitarbeitencode ein!' }),
    operator2Code: z
      .string()
      .min(1, { message: 'Bitte geben Sie den Mitarbeitencode ein!' })
      .optional(),
    operator3Code: z
      .string()
      .min(1, { message: 'Bitte geben Sie den Mitarbeitencode ein!' })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const { operator1Code, operator2Code, operator3Code } = data;
    if (operator2Code) {
      if (operator1Code === operator2Code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Sie können sich nicht mit zwei identischen Mitarbeitencodes anmelden!',
          path: ['operator2Code'],
        });
      }
    }
    if (operator3Code) {
      if (operator1Code === operator3Code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Sie können sich nicht mit zwei identischen Mitarbeitencodes anmelden!',
          path: ['operator3Code'],
        });
      }
      if (operator2Code === operator3Code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Sie können sich nicht mit zwei identischen Mitarbeitencodes anmelden!',
          path: ['operator3Code'],
        });
      }
    }
    if (operator2Code && operator3Code) {
      if (operator2Code === operator3Code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Sie können sich nicht mit zwei identischen Mitarbeitencodes anmelden!',
          path: ['operator3Code'],
        });
      }
    }
  });

export type ovenLoginType = z.infer<typeof ovenLoginSchema>;

export const newCardSchema = z.object({
  warehouse: z.string().min(1, { message: 'Bitte wählen Sie ein Lager aus!' }),
  sector: z.string().min(1, { message: 'Bitte wählen Sie einen Sektor aus!' }),
});

export const positionEditSchema = z.object({
  findArticle: z.string().optional(),
  article: z
    .string()
    .min(1, { message: 'Bitte wählen Sie einen Artikel aus!' }),
  quantity: z
    .string()
    .min(1, { message: 'Bitte geben Sie die Menge ein!' })
    .refine(
      (value) => {
        return /^\d+(\.\d{1,})?$/.test(value);
      },
      {
        message:
          'Bitte geben Sie einen gültigen Wert ein und verwenden Sie "." anstelle von ","!',
      },
    ),
  wip: z.boolean(),
  unit: z
    .string()
    .min(1, { message: 'Bitte wählen Sie eine Einheit aus!' })
    .optional(),
});
