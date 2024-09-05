'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { ArticleConfigType } from '@/lib/types/articleConfig';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function insertArticleConfig(articleConfig: ArticleConfigType) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const collection = await dbc('articles_config');

    const exists = await collection.findOne({
      articleNumber: articleConfig.articleNumber,
      workplace: articleConfig.workplace,
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

export async function updateArticleConfig(articleConfig: ArticleConfigType) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const collection = await dbc('articles_config');

    const exists = await collection.findOne({
      _id: new ObjectId(articleConfig._id),
    });

    if (!exists) {
      return { error: 'not found' };
    }

    const { _id, ...data } = articleConfig;
    const res = await collection.updateOne(
      { _id: new ObjectId(articleConfig._id) },
      { $set: data },
    );
    if (res) {
      revalidateTag('articleConfigs');
      return { success: 'updated' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while updating the article config.');
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

export async function copyArticle(articleId: string, workplaces: string) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const collection = await dbc('articles_config');

    const exists = await collection.findOne({ _id: new ObjectId(articleId) });

    if (!exists) {
      return { error: 'not found' };
    }

    const workplaceArray = workplaces
      .split(',')
      .map((workplace) => workplace.trim());

    const res = await Promise.all(
      workplaceArray.map((workplace) => {
        const { _id, ...rest } = exists; // Usuwamy _id
        return collection.insertOne({
          ...rest, // Kopiujemy resztę dokumentu
          workplace: workplace, // Zmieniamy miejsce pracy
        });
      }),
    );

    if (res) {
      revalidateTag('articleConfigs');
      return { success: 'copied' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while copying the article');
  }
}

export async function revalidateArticleConfigs() {
  revalidateTag('articleConfigs');
}
