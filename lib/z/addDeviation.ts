import * as z from 'zod';

export const addDeviationSchema = z.object({
  articleNumber: z
    .string()
    .min(5, { message: 'Wprowadź poprawny numer artykułu!' }),
  articleName: z
    .string()
    .min(5, { message: 'Wprowadź poprawną nazwę stanowiska!' }),
  workplace: z
    .string()
    .min(5, { message: 'Wprowadź poprawną nazwę stanowiska!' })
    .optional(),
  periodFrom: z.date({ message: 'Wprowadź poprawną datę!' }),
  periodTo: z.date({ message: 'Wprowadź poprawną datę!' }),
  drawingNumber: z
    .string({ message: 'Wprowadź numer rysunku!' })
    .min(5, { message: 'Wprowadź poprawny numer rysunku!' }),
  quantity: z
    .string({ message: 'Podaj ilość!' })
    .min(1, { message: 'Podaj ilość!' })
    .refine((value) => !isNaN(Number(value)), {
      message: 'Podaj poprawną liczbę!',
    }),
  reason: z.string().min(5, { message: 'Podaj powód!' }),
  description: z
    .string()
    .min(10, { message: 'Opis musi mieć długość min. 10 znaków!' }),
});

export type AddDeviationType = z.infer<typeof addDeviationSchema>;
