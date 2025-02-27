'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { NewOvertimeRequestType } from '../lib/production-overtime-zod';

export async function insertOvertimeRequest(
  data: NewOvertimeRequestType,
): Promise<{ success: 'inserted' } | { error: string }> {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const coll = await dbc('production_overtime');

    const overtimeRequestToInsert = {
      status: 'pending',
      ...data,
      requestedAt: new Date(),
      requestedBy: session.user.email,
    };

    const res = await coll.insertOne(overtimeRequestToInsert);
    if (res) {
      revalidateTag('production-overtime');
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'insertOvertimeRequest server action error' };
  }
}

export async function insertDraftOvertimeRequest(
  data: NewOvertimeRequestType,
): Promise<{ success: 'inserted' } | { error: string }> {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const coll = await dbc('production_overtime');
    const draftRequestToInsert = {
      status: 'draft',
      ...data,
      createdAt: new Date(),
      createdBy: session.user.email,
    };
    const res = await coll.insertOne(draftRequestToInsert);
    if (res.insertedId) {
      return { success: 'inserted' };
    }
    return { error: 'not inserted' };
  } catch (error) {
    console.error(error);
    return { error: 'insertDraftOvertimeRequest server action error' };
  }
}

export async function findArticleName(articleNumber: string) {
  try {
    const collection = await dbc('inventory_articles');
    const res = await collection.findOne({ number: articleNumber });
    if (res) {
      return { success: res.name };
    } else {
      return { error: 'not found' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'findArticleName server action error' };
  }
}

export async function redirectToProductionOvertime() {
  redirect('/production-overtime');
}

export async function revalidateReasons() {
  revalidateTag('deviationReasons');
}
