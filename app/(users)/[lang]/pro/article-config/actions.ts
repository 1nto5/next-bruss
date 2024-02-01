'use server';

import { dbc } from '@/lib/mongo';
// import { revalidatePath } from 'next/cache';

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

export async function saveArticleConfig(config: ArticleConfig) {
  try {
    const collection = await dbc('articles_config');

    let exists;

    exists = await collection.findOne({
      articleNumber: config.articleNumber,
      workplace: config.workplace,
      piecesPerBox: config.piecesPerBox,
    });

    if (exists && config.pallet) {
      exists = await collection.findOne({
        articleNumber: config.articleNumber,
        workplace: config.workplace,
        boxesPerPallet: config.boxesPerPallet,
      });
    }

    if (exists) {
      return { error: 'exists' };
    }

    const res = await collection.insertOne(config);
    if (res) return { success: 'inserted' };
    // revalidatePath('/', 'layout');
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving article config.');
  }
}
