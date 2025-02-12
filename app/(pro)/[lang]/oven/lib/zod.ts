import * as z from 'zod';

export const ovenLoginSchema = z
  .object({
    code1: z
      .string()
      .min(1, { message: 'Bitte geben Sie den Mitarbeitercode 1!' }),
    code2: z
      .string()
      .min(1, { message: 'Bitte geben Sie den Mitarbeitercode 2!' })
      .optional(),
    code3: z
      .string()
      .min(1, { message: 'Bitte geben Sie den Mitarbeitercode 3!' })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const { code1, code2, code3 } = data;
    if (code2) {
      if (code1 === code2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Es ist nicht möglich, sich mit identischen Mitarbeitercodes anzumelden!',
          path: ['code2'],
        });
      }
    }
    if (code3) {
      if (code1 === code3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Es ist nicht möglich, sich mit identischen Mitarbeitercodes anzumelden!',
          path: ['code3'],
        });
      }
      if (code1 === code3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Es ist nicht möglich, sich mit identischen Mitarbeitercodes anzumelden!',
          path: ['code3'],
        });
      }
    }
    if (code2 && code3) {
      if (code2 === code3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Es ist nicht möglich, sich mit identischen Mitarbeitercodes anzumelden!',
          path: ['code3'],
        });
      }
    }
  });

export type loginOvenType = z.infer<typeof ovenLoginSchema>;

export const addOvenProcessSchema = z
  .object({
    findArticle: z.string().optional(),
    article: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.article.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Wählen Sie einen Artikel aus, um einen Vorgang hinzuzufügen!',
        path: ['findArticle'],
      });
    }
  });

export type addOvenProcessType = z.infer<typeof addOvenProcessSchema>;
