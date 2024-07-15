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
  reason: z.string().min(5, { message: 'Podaj powód!' }),
  description: z
    .string()
    .min(10, { message: 'Opis musi mieć długość min. 10 znaków!' }),
});

export type AddDeviationType = z.infer<typeof addDeviationSchema>;
