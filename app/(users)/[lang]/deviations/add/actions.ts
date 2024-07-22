'use server';

import { dbc } from '@/lib/mongo';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { DeviationType } from '@/lib/types/deviation';
import { AddDeviationType, AddDeviationDraftType } from '@/lib/z/deviation';
import { getInitialsFromEmail } from '@/lib/utils/nameFormat';

export async function insertDeviation(deviation: AddDeviationType) {
  try {
    const session = await auth();
    if (!session) {
      redirect('/auth');
    }

    const collection = await dbc('deviations');

    const email = session.user.email;
    if (!email) {
      redirect('/auth');
    }

    const deviationToInsert: DeviationType = {
      status: 'approval',
      articleName: deviation.articleName,
      articleNumber: deviation.articleNumber,
      ...(deviation.workplace && { workplace: deviation.workplace }),
      ...(deviation.drawingNumber && {
        drawingNumber: deviation.drawingNumber,
      }),
      ...(deviation.quantity && { quantity: Number(deviation.quantity) }),
      ...(deviation.charge && { charge: deviation.charge }),
      reason: deviation.reason,
      timePeriod: { from: deviation.periodFrom, to: deviation.periodTo },
      ...(deviation.area && { area: deviation.area }),
      ...(deviation.description && { description: deviation.description }),
      ...(deviation.processSpecification && {
        processSpecification: deviation.processSpecification,
      }),
      createdAt: new Date(),
      ...(deviation.customerNumber && {
        customerNumber: deviation.customerNumber,
      }),
      customerAuthorization: deviation.customerAuthorization,
      owner: email,
    };

    const res = await collection.insertOne(deviationToInsert);
    if (res) {
      revalidateTag('deviations');
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the deviation.');
  }
}

export async function insertDraftDeviation(deviation: AddDeviationDraftType) {
  try {
    const session = await auth();
    if (!session || !session.user.email) {
      redirect('/auth');
    }

    const collection = await dbc('deviations');

    const deviationDraftToInsert: DeviationType = {
      status: 'draft',
      ...(deviation.articleName && { articleName: deviation.articleName }),
      ...(deviation.articleNumber && {
        articleNumber: deviation.articleNumber,
      }),
      ...(deviation.workplace && { workplace: deviation.workplace }),
      ...(deviation.drawingNumber && {
        drawingNumber: deviation.drawingNumber,
      }),
      ...(deviation.quantity && { quantity: Number(deviation.quantity) }),
      ...(deviation.charge && { charge: deviation.charge }),
      ...(deviation.reason && { reason: deviation.reason }),
      timePeriod: { from: deviation.periodFrom, to: deviation.periodTo },
      ...(deviation.area && { area: deviation.area }),
      ...(deviation.description && { description: deviation.description }),
      ...(deviation.processSpecification && {
        processSpecification: deviation.processSpecification,
      }),
      createdAt: new Date(),
      ...(deviation.customerNumber && {
        customerNumber: deviation.customerNumber,
      }),
      customerAuthorization: deviation.customerAuthorization,
      owner: session.user.email,
    };

    const res = await collection.insertOne(deviationDraftToInsert);
    if (res) {
      revalidateTag('deviations');
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the deviation.');
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
    throw new Error('An error occurred while fetching the article name.');
  }
}
