import * as z from 'zod';

export const addDeviationSchema = z.object({
  articleNumber: z
    .string({ message: 'Wprowadź numer artykułu!' })
    .min(5, { message: 'Wprowadź poprawny numer artykułu!' }),
  articleName: z
    .string({ message: 'Wprowadź nazwę artykułu!' })
    .min(5, { message: 'Wprowadź poprawną nazwę artykułu!' }),
  customerNumber: z.string().optional(),
  customerName: z.string().optional(),
  workplace: z
    .string()
    .min(5, { message: 'Wprowadź poprawną nazwę stanowiska!' })
    .optional(),
  drawingNumber: z
    .string() // { message: 'Wprowadź numer rysunku!' }
    .min(5, { message: 'Wprowadź poprawny numer rysunku!' })
    .optional(),
  quantity: z
    .string() // .string({ message: 'Podaj ilość!' })
    .min(1, { message: 'Podaj ilość!' })
    .refine((value) => !isNaN(Number(value)), {
      message: 'Podaj poprawną liczbę!',
    })
    .optional(),
  unit: z.string().optional(),
  charge: z.string().optional(),
  description: z
    .string()
    .min(10, { message: 'Opis musi mieć długość min. 10 znaków!' })
    .optional(),
  reason: z.string({ message: 'Wybierz powód!' }),
  periodFrom: z.date({ message: 'Wybierz datę!' }),
  periodTo: z.date({ message: 'Wybierz datę!' }),
  area: z
    .string()
    .min(2, { message: 'Wprowadź poprawną nazwę obszaru!' })
    .optional(),
  processSpecification: z.string().optional(),
  customerAuthorization: z.boolean(),
});

export type AddDeviationType = z.infer<typeof addDeviationSchema>;

export const addDeviationDraftSchema = z.object({
  articleNumber: z.string().optional(),
  articleName: z.string().optional(),
  customerNumber: z.string().optional(),
  customerName: z.string().optional(),
  workplace: z
    .string()
    .min(5, { message: 'Wprowadź poprawną nazwę stanowiska!' })
    .optional(),
  drawingNumber: z
    .string() // { message: 'Wprowadź numer rysunku!' }
    .min(5, { message: 'Wprowadź poprawny numer rysunku!' })
    .optional(),
  quantity: z
    .string() // .string({ message: 'Podaj ilość!' })
    .min(1, { message: 'Podaj ilość!' })
    .refine((value) => !isNaN(Number(value)), {
      message: 'Podaj poprawną liczbę!',
    })
    .optional(),
  unit: z.string().optional(),
  charge: z.string().optional(),
  description: z
    .string()
    .min(10, { message: 'Opis musi mieć długość min. 10 znaków!' })
    .optional(),
  reason: z.string().optional(),
  periodFrom: z.date({ message: 'Wybierz datę!' }),
  periodTo: z.date({ message: 'Wybierz datę!' }),
  area: z
    .string()
    .min(2, { message: 'Wprowadź poprawną nazwę obszaru!' })
    .optional(),
  processSpecification: z.string().optional(),
  customerAuthorization: z.boolean(),
});

export type AddDeviationDraftType = z.infer<typeof addDeviationDraftSchema>;

export const addCorrectiveActionSchema = z.object({
  description: z
    .string({ message: 'Wprowadź opis!' })
    .min(10, { message: 'Opis musi mieć długość min. 10 znaków!' }),
  responsible: z.string({ message: 'Wybierz osobę odpowiedzialną!' }),
  deadline: z.date({ message: 'Wybierz datę!' }),
});

export type AddCorrectiveActionType = z.infer<typeof addCorrectiveActionSchema>;

export const confirmActionExecutionSchema = z.object({
  comment: z.string().optional(),
  status: z.string({ message: 'Wybierz status!' }),
  executedAt: z.date({ message: 'Wybierz datę!' }),
});

export type confirmActionExecutionType = z.infer<
  typeof confirmActionExecutionSchema
>;
