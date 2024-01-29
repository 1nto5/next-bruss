'use server';

import { dbc } from '@/lib/mongo';

type ArticleConfig = {
  workplace: string; // Matches z.string().regex()
  articleNumber: string; // Matches z.string().length().regex()
  articleName: string; // Matches z.string().min()
  articleNote?: string; // Matches z.string().optional()
  piecesPerBox: string; // Matches z.string().refine()
  pallet?: boolean; // Matches z.boolean().default().optional()
  boxesPerPallet?: string; // Matches z.string().optional()
  dmc: string; // Matches z.string().min()
  dmcFirstValidation: string; // Matches z.string().min()
  secondValidation?: boolean; // Matches z.boolean().default().optional()
  dmcSecondValidation?: string; // Matches z.string().optional()
  hydraProcess: string; // Matches z.string().refine()
  ford?: boolean; // Matches z.boolean().default().optional()
  bmw?: boolean; // Matches z.boolean().default().optional()
};

export async function saveArticleConfig(
  config: ArticleConfig,
): Promise<boolean> {
  try {
    const collection = await dbc('articles_config');
    const result = await collection.insertOne(config);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving article config.');
  }
}
