'use server';

import { auth } from '@/lib/auth';
import { dbc } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { NewsFormData } from './lib/zod';

export async function createNews(data: NewsFormData) {
  const session = await auth();
  if (!session?.user?.roles?.includes('admin')) {
    return { error: 'unauthorized' };
  }

  try {
    const collection = await dbc('news');
    await collection.insertOne({
      ...data,
      author: session.user.email,
      createdAt: new Date(),
    });

    revalidateTag('news');
    return { success: 'createSuccess' };
  } catch (error) {
    console.error('createNews error:', error);
    return { error: 'createError' };
  }
}

export async function updateNews(id: string, data: NewsFormData) {
  const session = await auth();
  if (!session?.user?.roles?.includes('admin')) {
    return { error: 'unauthorized' };
  }

  try {
    const collection = await dbc('news');

    if (ObjectId.isValid(id)) {
      await collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
    } else {
      await collection.updateOne({ _id: id as any }, { $set: data });
    }

    revalidateTag('news');
    return { success: 'updateSuccess' };
  } catch (error) {
    console.error('updateNews error:', error);
    return { error: 'updateError' };
  }
}

export async function deleteNews(id: string) {
  const session = await auth();
  if (!session?.user?.roles?.includes('admin')) {
    return { error: 'unauthorized' };
  }

  try {
    const collection = await dbc('news');

    if (ObjectId.isValid(id)) {
      await collection.deleteOne({ _id: new ObjectId(id) });
    } else {
      await collection.deleteOne({ _id: id as any });
    }
    revalidateTag('news');
    return { success: 'deleteSuccess' };
  } catch (error) {
    console.error('deleteNews error:', error);
    return { error: 'deleteError' };
  }
}

export async function togglePin(id: string, isPinned: boolean) {
  const session = await auth();
  if (!session?.user?.roles?.includes('admin')) {
    return { error: 'unauthorized' };
  }

  try {
    const collection = await dbc('news');

    if (ObjectId.isValid(id)) {
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isPinned } },
      );
    } else {
      await collection.updateOne({ _id: id as any }, { $set: { isPinned } });
    }

    revalidateTag('news');
    return { success: isPinned ? 'pinSuccess' : 'unpinSuccess' };
  } catch (error) {
    console.error('togglePin error:', error);
    return { error: 'pinError' };
  }
}

export async function refreshNews() {
  const session = await auth();
  if (!session?.user?.roles?.includes('admin')) {
    return { error: 'unauthorized' };
  }

  try {
    revalidateTag('news');
    return { success: 'refreshSuccess' };
  } catch (error) {
    console.error('refreshNews error:', error);
    return { error: 'refreshError' };
  }
}

export async function redirectToHome(lang: string) {
  redirect(`/${lang}`);
}
