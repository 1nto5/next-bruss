import { z } from 'zod';

export const createNewsSchema = (validation: {
  titleRequired: string;
  titleMaxLength: string;
  contentRequired: string;
}) => {
  return z.object({
    title: z
      .string()
      .min(1, validation.titleRequired)
      .max(200, validation.titleMaxLength),
    content: z.string().min(1, validation.contentRequired),
    isPinned: z.boolean().default(false)
  });
};

export type NewsFormData = z.infer<ReturnType<typeof createNewsSchema>>;