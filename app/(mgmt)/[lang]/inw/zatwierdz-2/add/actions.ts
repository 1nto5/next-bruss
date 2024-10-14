'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { DeviationType } from '@/lib/types/deviation';
import { AddDeviationDraftType, AddDeviationType } from '@/lib/z/deviation';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function insertDeviation(deviation: AddDeviationType) {
  const session = await auth();
  if (!session || !session.user.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');

    const deviationToInsert: DeviationType = {
      status: 'approval',
      articleName: deviation.articleName,
      articleNumber: deviation.articleNumber,
      ...(deviation.workplace && { workplace: deviation.workplace }),
      ...(deviation.drawingNumber && {
        drawingNumber: deviation.drawingNumber,
      }),
      ...(deviation.quantity && {
        quantity: {
          value: Number(deviation.quantity),
          unit: deviation.unit && deviation.unit,
        },
      }),
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
      owner: session.user.email,
      correctiveActions: [],
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
    return { error: 'insertDeviation server action error' };
  }
}

export async function insertDraftDeviation(deviation: AddDeviationDraftType) {
  const session = await auth();
  if (!session || !session.user.email) {
    redirect('/auth');
  }

  try {
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
      ...(deviation.quantity && {
        quantity: {
          value: Number(deviation.quantity),
          unit: deviation.unit && deviation.unit,
        },
      }),
      ...(deviation.unit && { unit: deviation.unit }),
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
      correctiveActions: [],
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
    return { error: 'insertDraftDeviation server action error' };
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

export async function redirectToDeviations() {
  redirect('/deviations');
}

export async function revalidateReasons() {
  revalidateTag('deviationReasons');
}
