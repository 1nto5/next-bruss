import * as z from 'zod';

export const addDeviationSchema = z
  .object({
    articleNumber: z
      .string({ message: 'Wprowadź numer artykułu!' })
      .min(5, { message: 'Wprowadź poprawny numer artykułu!' }),
    articleName: z
      .string({ message: 'Wprowadź nazwę artykułu!' })
      .min(5, { message: 'Wprowadź poprawną nazwę artykułu!' }),
    customerNumber: z.string().optional(),
    customerName: z.string().optional(),
    workplace: z.string().optional(),
    quantity: z
      .string() // Keep as string for input, refine for number
      .optional() // Making quantity optional
      .refine(
        (value) => !value || (!isNaN(Number(value)) && Number(value) > 0),
        {
          message: 'Podaj poprawną, dodatnią liczbę!',
        },
      ),
    unit: z.string().min(1, { message: 'Podaj jednostkę!' }).optional(), // Making unit optional
    charge: z.string().optional(),
    description: z
      .string({ message: 'Wprowadź opis odchylenia!' })
      .min(10, { message: 'Opis musi mieć długość min. 10 znaków!' }),
    reason: z.string({ message: 'Wybierz powód!' }),
    periodFrom: z
      .date({ message: 'Wybierz datę!' })
      .min(
        (() => {
          const today = new Date();
          today.setDate(today.getDate() - 7); // Allow starting up to 7 days ago
          today.setHours(0, 0, 0, 0); // Set time to start of the day
          return today;
        })(),
        { message: 'Data rozpoczęcia nie może być starsza niż 7 dni!' },
      )
      .max(
        (() => {
          const today = new Date();
          today.setDate(today.getDate() + 7); // Allow starting up to 7 days in the future
          today.setHours(23, 59, 59, 999); // Set time to end of the day
          return today;
        })(),
        { message: 'Data rozpoczęcia nie może być późniejsza niż 7 dni!' },
      ),
    periodTo: z.date({ message: 'Wybierz datę!' }).max(
      (() => {
        const today = new Date();
        today.setDate(today.getDate() + 30); // Allow ending up to 30 days in the future
        today.setHours(23, 59, 59, 999); // Set time to end of the day
        return today;
      })(),
      { message: 'Data zakończenia nie może być późniejsza niż 30 dni!' },
    ),
    area: z.string({ message: 'Wybierz obszar!' }),
    processSpecification: z.string().optional(),
    customerAuthorization: z.boolean(),
  })
  .refine((data) => data.periodTo >= data.periodFrom, {
    message: 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia!',
    path: ['periodTo'], // Assign the error to the periodTo field
  })
  .refine(
    (data) => {
      // If quantity is provided (not undefined, not empty string, and > 0), unit must also be provided
      const quantityValue = data.quantity ? Number(data.quantity) : NaN;
      if (
        data.quantity &&
        data.quantity.trim() !== '' &&
        !isNaN(quantityValue) &&
        quantityValue > 0
      ) {
        return data.unit && data.unit.trim() !== '';
      }
      return true; // Otherwise (quantity empty or invalid), validation passes regarding unit
    },
    {
      message: 'Podaj jednostkę, jeśli podałeś ilość większą od 0!',
      path: ['unit'], // Assign the error to the unit field
    },
  );

export type AddDeviationType = z.infer<typeof addDeviationSchema>;

export const addDeviationDraftSchema = z
  .object({
    articleNumber: z.string().optional(),
    articleName: z.string().optional(),
    customerNumber: z.string().optional(),
    customerName: z.string().optional(),
    workplace: z.string().optional(),
    quantity: z
      .string()
      .optional() // Optional for draft
      .nullable() // Allow null
      .refine(
        (value) => !value || (!isNaN(Number(value)) && Number(value) >= 0), // Allow empty, null, or non-negative number string
        {
          message: 'Podaj poprawną liczbę (lub pozostaw puste)!',
        },
      ),
    unit: z.string().optional(), // Optional for draft, but linked to quantity below
    charge: z.string().optional(),
    description: z
      .string()
      .optional() // Optional for draft
      .refine(
        (value) => !value || value.length === 0 || value.length >= 10, // Allow empty or min 10 chars
        {
          message: 'Opis musi mieć długość min. 10 znaków (lub być pusty)!',
        },
      ),
    reason: z.string().optional(), // Optional for draft
    periodFrom: z.date().optional().nullable(), // Optional for draft
    periodTo: z.date().optional().nullable(), // Optional for draft
    area: z.string().optional(), // Optional for draft
    processSpecification: z.string().optional(),
    customerAuthorization: z.boolean().optional(), // Optional for draft
  })
  .refine(
    (data) => {
      // If quantity is provided (not null, not undefined, not empty string, and > 0), unit must also be provided
      const quantityValue = data.quantity ? Number(data.quantity) : NaN;
      if (
        data.quantity &&
        data.quantity.trim() !== '' &&
        !isNaN(quantityValue) &&
        quantityValue > 0
      ) {
        return data.unit && data.unit.trim() !== '';
      }
      return true; // Otherwise (quantity empty, 0, or invalid), validation passes regarding unit
    },
    {
      message: 'Podaj jednostkę, jeśli podałeś ilość większą od 0!',
      path: ['unit'], // Assign the error to the unit field
    },
  )
  .refine(
    (data) => {
      // If both dates are provided, periodTo must be >= periodFrom
      if (data.periodFrom && data.periodTo) {
        return data.periodTo >= data.periodFrom;
      }
      return true; // Pass if one or both dates are missing
    },
    {
      message:
        'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia!',
      path: ['periodTo'],
    },
  );

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

export const AttachmentFormSchema = z.object({
  file: z
    .instanceof(File, { message: 'Plik jest wymagany!' })
    .refine((file) => file.size > 0, { message: 'Plik jest pusty!' })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'Plik jest za duży (max 10MB)',
    }),
  name: z
    .string({ message: 'Nazwa jest wymagana!' })
    .min(5, { message: 'Nazwa jest za krótka!' }),
  note: z.string().optional(),
});

export type AttachmentFormType = z.infer<typeof AttachmentFormSchema>;

export const rejectDeviationSchema = z.object({
  reason: z
    .string({ message: 'Powód odrzucenia jest wymagany!' })
    .min(10, { message: 'Powód odrzucenia musi mieć co najmniej 10 znaków!' })
    .max(500, { message: 'Powód odrzucenia nie może przekraczać 500 znaków!' }),
});

export type RejectDeviationType = z.infer<typeof rejectDeviationSchema>;

// Add note schema
export const NoteFormSchema = z.object({
  content: z
    .string()
    .min(1, 'Notatka nie może być pusta')
    .max(1000, 'Notatka nie może przekraczać 1000 znaków'),
});

export type NoteFormType = z.infer<typeof NoteFormSchema>;
