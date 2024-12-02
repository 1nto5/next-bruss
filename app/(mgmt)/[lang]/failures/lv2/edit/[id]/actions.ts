'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { DeviationType } from '@/lib/types/deviation';
import { AddDeviationDraftType, AddDeviationType } from '@/lib/z/deviation';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function findDeviation(id: string): Promise<DeviationType | null> {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');
    const res = await collection.findOne({
      _id: new ObjectId(id),
    });
    console.log('res', res);
    if (res && res.status === 'draft' && res.owner === session.user?.email) {
      const { _id, ...deviation } = res;
      return { id: _id.toString(), ...deviation } as DeviationType;
    }

    return null;
  } catch (error) {
    console.error(error);
    throw new Error('findDeviation server action error');
  }
}

async function deleteDraftDeviation(id: string) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');
    const res = await collection.deleteOne({
      _id: new ObjectId(id),
      owner: session.user?.email,
      status: 'draft',
    });
    if (res) {
      revalidateTag('deviations');
      return { success: 'deleted' };
    } else {
      return { error: 'not deleted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'deleteDraftDeviation server action error' };
  }
}

export async function insertDeviationFromDraft(
  id: string,
  deviation: AddDeviationType,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
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
      owner: session.user?.email,
      correctiveActions: [],
    };

    const res = await collection.insertOne(deviationToInsert);
    if (res) {
      revalidateTag('deviations');
      const deleteRes = await deleteDraftDeviation(id);
      if (deleteRes.error) {
        return { error: deleteRes.error };
      }
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'insertDeviationFromDraft server action error' };
  }
}

export async function updateDraftDeviation(
  id: string,
  deviation: AddDeviationDraftType,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }

  try {
    const collection = await dbc('deviations');

    const deviationDraftToUpdate: DeviationType = {
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
      owner: session.user?.email,
      correctiveActions: [],
    };
    const res = await collection.updateOne(
      { _id: new ObjectId(id), status: 'draft', owner: session.user?.email },
      { $set: deviationDraftToUpdate },
    );
    if (res.modifiedCount > 0) {
      revalidateTag('deviations');
      return { success: 'updated' };
    } else {
      return { error: 'not updated' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'updateDraftDeviation server action error' };
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
