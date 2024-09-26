import * as z from 'zod';

export const inventoryLoginSchema = z.object({
  personalNumber1: z.string().min(1, { message: 'Wprowadź numer personalny!' }),
  password1: z.string().min(1, { message: 'Wprowadź hasło!' }),
  personalNumber2: z.string().min(1, { message: 'Wprowadź numer personalny!' }),
  password2: z.string().min(1, { message: 'Wprowadź hasło!' }),
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
