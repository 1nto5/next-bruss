'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { DeviationType } from '@/lib/types/deviation';
import { AddCorrectiveActionType } from '@/lib/z/deviation';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function insertCorrectiveAction(
  deviation: AddCorrectiveActionType,
) {
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

export async function redirectToDeviation(id: string) {
  redirect(`/deviations/${id}}`);
}

export async function revalidateReasons() {
  revalidateTag('deviationReasons');
}
