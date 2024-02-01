'use server';

import { dbc } from '@/lib/mongo';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export async function getArticlesConfigForWorkplace(workplace: string) {
  const collection = await dbc('articles_config');
  const res = await collection.find({ workplace }).toArray();
  console.log('pobieranie');
  return res;
}

export async function revalidateTest() {
  console.log('revalidate');
  revalidatePath('/(persons-new)/[lang]/dmcheck/[worklace]', 'page');
}

export async function pushArticleConfigId(prevState: any, formData: FormData) {
  redirect(`test`);
}

export async function redirectToArticle(
  prevState: {
    message: string;
  },
  formData: FormData,
) {
  const schema = z.object({
    articleConfigId: z.string().min(10),
  });
  const parse = schema.safeParse({
    articleConfigId: formData.get('articleConfigId'),
  });
  if (!parse.success) {
    return { message: 'Failed to redirect' };
  }
  const data = parse.data;

  redirect(data.articleConfigId);
}
