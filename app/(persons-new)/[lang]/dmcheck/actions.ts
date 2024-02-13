'use server';

import { dbc } from '@/lib/mongo';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export async function getArticlesConfigForWorkplace(workplace: string) {
  const collection = await dbc('articles_config');
  const res = await collection.find({ workplace }).toArray();
  // console.log('pobieranie');
  return res;
}

export async function revalidateTest() {
  // console.log('revalidate');
  revalidatePath('/(persons-new)/[lang]/dmcheck/[worklace]', 'page');
}

export async function pushArticleConfigId(prevState: any, formData: FormData) {
  redirect(`test`);
}

export async function personLogin(
  prevState: {
    message: string;
  },
  formData: FormData,
) {
  const schema = z.object({
    personalNumber: z.string().min(1).max(4),
  });
  const parse = schema.safeParse({
    personalNumber: formData.get('personalNumber'),
  });
  if (!parse.success) {
    return { message: 'not valid' };
  }
  const data = parse.data;

  return {
    message: 'error',
  };
}
