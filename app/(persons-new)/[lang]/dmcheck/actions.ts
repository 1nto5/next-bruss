'use server';

import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export async function getArticlesConfigForWorkplace(workplace: string) {
  const collection = await dbc('articles_config');
  const res = await collection.find({ workplace }).toArray();
  // console.log('pobieranie');
  return res;
}

export async function getArticleConfigById(id: string) {
  const collection = await dbc('articles_config');
  const res = await collection.findOne({ _id: new ObjectId(id) });
  return res;
}

export async function revalidateTest() {
  // console.log('revalidate');
  revalidateTag('65ba50d4a7428022c001d0c5');
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

  console.log(data);
  try {
    const collection = await dbc('persons');
    const person = await collection.findOne({
      personalNumber: data.personalNumber,
    });
    if (!person) {
      return { message: 'not exist' };
    }
    console.log(person);
    return { message: 'exist' };
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred during the login process.');
  }
}

export async function getOperatorName(personalNumber: string) {
  const collection = await dbc('persons');
  const res = await collection.findOne({ personalNumber });
  return res?.name;
}
