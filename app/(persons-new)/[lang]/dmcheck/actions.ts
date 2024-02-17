'use server';

import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// FORD DATE VALIDATION
function fordDateValidation(dmc: string) {
  const today = new Date();
  const year = today.getFullYear();
  const start = new Date(year, 0, 0);
  const diff = today.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dotyGreg = Math.floor(diff / oneDay);
  const dotyJul = dotyGreg > 13 ? dotyGreg - 13 : 365 - 13 + dotyGreg;
  const dmcDotyJul = parseInt(dmc.substr(7, 3));
  return (
    dmcDotyJul === dotyJul ||
    dmcDotyJul === dotyJul - 1 ||
    dmcDotyJul === dotyJul - 2
  );
}

// BMW DATE VALIDATION
function bmwDateValidation(dmc: string) {
  const todayDate = parseInt(
    new Date().toISOString().slice(2, 10).split('-').join(''),
  );
  const tomorrowDate = parseInt(
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(2, 10)
      .split('-')
      .join(''),
  );
  const yesterdayDate = parseInt(
    new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(2, 10)
      .split('-')
      .join(''),
  );
  const dayBeforeYesterdayDate = parseInt(
    new Date(new Date().getTime() - 48 * 60 * 60 * 1000)
      .toISOString()
      .slice(2, 10)
      .split('-')
      .join(''),
  );
  const dmcDate = parseInt(dmc.slice(17, 23));
  return (
    dmcDate === todayDate ||
    dmcDate === tomorrowDate ||
    dmcDate === yesterdayDate ||
    dmcDate === dayBeforeYesterdayDate
  );
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
  try {
    const collection = await dbc('persons');
    const person = await collection.findOne({
      personalNumber: data.personalNumber,
    });
    if (!person) {
      return { message: 'not exist' };
    }
    return { message: person._id.toString() };
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred during the login process.');
  }
}

export async function getArticlesConfigForWorkplace(workplace: string) {
  const collection = await dbc('articles_config');
  return await collection.find({ workplace }).toArray();
}

export async function getArticleConfigById(articleConfigId: string) {
  const collection = await dbc('articles_config');
  return await collection.findOne({ _id: new ObjectId(articleConfigId) });
}

export async function getOperatorById(operatorId: string) {
  const collection = await dbc('persons');
  return await collection.findOne({ _id: new ObjectId(operatorId) });
}

export async function saveDmc(prevState: any, formData: FormData) {
  const articleConfigId = formData.get('articleConfigId');
  const articlesConfigCollection = await dbc('articles_config');
  if (!articleConfigId || articleConfigId.toString().length !== 24) {
    return { message: 'wrong article config id' };
  }
  const articleConfig = await articlesConfigCollection.findOne({
    _id: new ObjectId(articleConfigId.toString()),
  });
  if (!articleConfig) {
    return { message: 'wrong article config id' };
  }
  const schema = z.object({
    dmc: z
      .string()
      .length(articleConfig.dmc.length)
      .includes(articleConfig.dmcFirstValidation)
      .refine(
        (dmc) =>
          !articleConfig.secondValidation ||
          dmc.includes(articleConfig.dmcSecondValidation),
      ),
  });
  const parse = schema.safeParse({
    dmc: formData.get('dmc'),
  });
  if (!parse.success) {
    return { message: 'not valid' };
  }
  const data = parse.data;

  const scansCollection = await dbc('scans');

  const insertResult = await scansCollection.insertOne({
    status: 'box',
    dmc: data.dmc,
    workplace: articleConfig.workplace,
    type: articleConfig.type,
    article: articleConfig.articleNumber,
    operator: formData.get('operatorPersonalNumber'),
    time: new Date(),
  });

  if (insertResult) {
    revalidateTag(`box${articleConfigId}`);
    return { message: 'saved' };
  }
}
