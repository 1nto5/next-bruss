import * as z from 'zod';

export const loginSchema = z
  .object({
    identifier1: z.string().min(1, { message: 'Wprowadź numer personalny!' }),
    identifier2: z
      .string()
      .min(1, { message: 'Wprowadź numer personalny!' })
      .optional(),
    identifier3: z
      .string()
      .min(1, { message: 'Wprowadź numer personalny!' })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const { identifier1, identifier2, identifier3 } = data;
    if (identifier2) {
      if (identifier1 === identifier2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same numery personalne!',
          path: ['identifier2'],
        });
      }
    }
    if (identifier3) {
      if (identifier1 === identifier3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same numery personalne!',
          path: ['identifier3'],
        });
      }
      if (identifier2 === identifier3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nie można zalogować na dwa takie same numery personalne!',
          path: ['identifier3'],
        });
      }
    }
  });

export type loginType = z.infer<typeof loginSchema>;

// Schema for starting a new HYDRA batch process (client-side validation)
export const startBatchSchema = z.object({
  scannedArticle: z.string().regex(/^\d{5}$/, {
    message: 'Artykuł musi mieć dokładnie 5 cyfr!',
  }),
  scannedBatch: z.string().length(10, {
    message: 'HYDRA batch musi mieć dokładnie 10 znaków!',
  }),
});

// Schema for ending a HYDRA batch process (client-side validation)
export const endBatchSchema = z.object({
  scannedBatch: z.string().length(10, {
    message: 'HYDRA batch musi mieć dokładnie 10 znaków!',
  }),
});

// Server-side validation schemas with English messages
export const startBatchSchemaServer = z.object({
  scannedArticle: z.string().regex(/^\d{5}$/, {
    message: 'invalid article',
  }),
  scannedBatch: z.string().length(10, {
    message: 'invalid batch',
  }),
});

export const endBatchSchemaServer = z.object({
  scannedBatch: z.string().length(10, {
    message: 'invalid batch',
  }),
});

export type StartBatchType = z.infer<typeof startBatchSchema>;
export type EndBatchType = z.infer<typeof endBatchSchema>;

// Schema for validating process completion (server-side)
export const completeProcessSchema = z.object({
  processId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: 'invalid id',
  }),
  notes: z.string().optional(),
});

export type CompleteProcessType = z.infer<typeof completeProcessSchema>;

export const startOvenProcessSchema = z.object({
  article: z.string().min(1, { message: 'Wprowadź numer artykułu!' }),
  hydraBatch: z.string().min(1, { message: 'Wprowadź numer HYDRA batch!' }),
  operator: z.array(z.string().min(1)).min(1),
});

export type StartOvenProcessType = z.infer<typeof startOvenProcessSchema>;
