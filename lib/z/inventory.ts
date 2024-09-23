import * as z from 'zod';

export const inventoryLoginSchema = z.object({
  personalNumber1: z.string().min(1, { message: 'Wprowadź numer personalny!' }),
  password1: z.string().min(1, { message: 'Wprowadź hasło!' }),
  personalNumber2: z.string().min(1, { message: 'Wprowadź numer personalny!' }),
  password2: z.string().min(1, { message: 'Wprowadź hasło!' }),
});

export type loginInventoryType = z.infer<typeof inventoryLoginSchema>;

export const newCardSchema = z.object({
  personalNumber1: z.string().min(1, { message: 'Wprowadź numer personalny!' }),
  password1: z.string().min(1, { message: 'Wprowadź hasło!' }),
  personalNumber2: z.string().min(1, { message: 'Wprowadź numer personalny!' }),
  password2: z.string().min(1, { message: 'Wprowadź hasło!' }),
});
