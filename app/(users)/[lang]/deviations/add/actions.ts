'use server';

import { dbc } from '@/lib/mongo';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { DeviationType } from '@/lib/types/deviation';
import { AddDeviationType } from '@/lib/z/addDeviation';
import { de } from 'date-fns/locale';

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
      deviationId: 'AA' + new Date().getTime(),
      status: 'approval',
      articleName: deviation.articleName,
      articleNumber: deviation.articleNumber,
      timePeriod: { from: deviation.periodFrom, to: deviation.periodTo },
      reason: deviation.reason,
      customerAuthorization: deviation.customerAuthorization,
      owner: email,
      createdAt: new Date(),
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
