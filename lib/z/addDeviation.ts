import * as z from 'zod';

export const addDeviationSchema = z.object({
  articleNumber: z
    .string({ message: 'Wprowadź numer artykułu!' })
    .min(5, { message: 'Wprowadź poprawny numer artykułu!' }),
  articleName: z
    .string()
    .min(5, { message: 'Wprowadź poprawną nazwę stanowiska!' }),
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
  charge: z.string().optional(),
  description: z
    .string()
    .min(10, { message: 'Opis musi mieć długość min. 10 znaków!' })
    .optional(),
  reason: z.string().min(5, { message: 'Wybierz powód!' }),
  periodFrom: z.date({ message: 'Wybierz datę!' }),
  periodTo: z.date({ message: 'Wybierz datę!' }),
  area: z
    .string()
    .min(2, { message: 'Wprowadź poprawną nazwę obszaru!' })
    .optional(),
  processSpecification: z.string().optional(),
  customerNumber: z.string().optional(),
  customerAuthorization: z.boolean(),
});

export type AddDeviationType = z.infer<typeof addDeviationSchema>;
