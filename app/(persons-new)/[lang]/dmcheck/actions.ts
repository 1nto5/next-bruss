'use server';

import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

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

export async function getBoxStatus(
  articleConfigId: string,
  // workplace: string,
  // articleNumber: string,
) {
  const articlesConfigCollection = await dbc('articles_config');
  const articleConfig = await articlesConfigCollection.findOne({
    _id: new ObjectId(articleConfigId),
  });
  if (!articleConfig) {
    return null;
  }
  const scansCollection = await dbc('scans');
  const count = await scansCollection.countDocuments({
    status: 'box',
    workplace: articleConfig.workplace,
    article: articleConfig.articleNumber,
  });
  // const count = await scansCollection.countDocuments({
  //   status: 'box',
  //   workplace: workplace,
  //   article: articleNumber,
  // });

  // console.log('count' + count);
  return { piecesInBox: count, boxIsFull: count >= articleConfig.piecesPerBox };
}

export async function getPalletStatus(articleConfigId: string) {
  const articlesConfigCollection = await dbc('articles_config');
  const articleConfig = await articlesConfigCollection.findOne({
    _id: new ObjectId(articleConfigId),
  });
  if (!articleConfig) {
    return null;
  }
  const scansCollection = await dbc('scans');
  const count = await scansCollection.countDocuments({
    status: 'pallet',
    workplace: articleConfig.workplace,
    article: articleConfig.articleNumber,
  });

  return {
    boxesOnPallet: count / articleConfig.piecesPerBox,
    palletIsFull:
      count / articleConfig.piecesPerBox >= articleConfig.boxesPerPallet,
  };
}

// export async function revalidateTest() {
//   console.log('revalidate');
//   // revalidateTag('test');
//   revalidatePath('/pl/dmcheck/eol74/65ba50d4a7428022c001d0c5/1394');
// }

export async function saveDmc(
  prevState: {
    message: string;
  },
  formData: FormData,
) {
  const articleConfigId = formData.get('articleConfigId');
  const articlesConfigCollection = await dbc('articles_config');
  if (articleConfigId?.toString().length !== 24) {
    return { message: 'wrong article config id' };
  }
  const articleConfig = await articlesConfigCollection.findOne({
    _id: new ObjectId(articleConfigId.toString()),
  });
  if (!articleConfig) {
    return { message: 'wrong article config id' };
  }

  console.log(articleConfig);
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
  return { message: 'saved' };
}
