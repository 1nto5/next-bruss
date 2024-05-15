'use server';

import { dbc } from '@/lib/mongo';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { ObjectId } from 'mongodb';
import { ArticleConfigType } from '@/lib/types/articleConfig';

export async function insertArticleConfig(articleConfig: ArticleConfigType) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const collection = await dbc('dmcheck_configs');

    const exists = await collection.findOne({
      articleNumber: articleConfig.articleNumber,
    });
    if (exists) {
      return { error: 'exists' };
    }

    const { _id, ...data } = articleConfig;
    const res = await collection.insertOne(data);
    if (res) {
      revalidateTag('articleConfigs');
      return { success: 'inserted' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while inserting the article config.');
  }
}

export async function getArticleConfig(
  articleConfigId: ObjectId,
): Promise<ArticleConfigType | null> {
  try {
    const collection = await dbc('articles_config');
    const config = await collection.findOne({
      _id: articleConfigId,
    });
    if (config) {
      config._id = new ObjectId(config._id.toString());
    }
    return config as ArticleConfigType | null;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while fetching the article config.');
  }
}

export async function deleteArticle(userId: string) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const collection = await dbc('articles_config');

    const exists = await collection.findOne({ _id: new ObjectId(userId) });

    if (!exists) {
      return { error: 'not found' };
    }

    const res = await collection.deleteOne({ _id: new ObjectId(userId) });
    if (res) {
      revalidateTag('articleConfigs');
      return { success: 'deleted' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while deleting the user');
  }
}

export async function revalidateArticleConfigs() {
  revalidateTag('articleConfigs');
}
