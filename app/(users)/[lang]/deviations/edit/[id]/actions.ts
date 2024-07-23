'use server';

import { dbc } from '@/lib/mongo';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { DeviationType } from '@/lib/types/deviation';
import { ObjectId } from 'mongodb';

export async function updateDeviation(deviation: DeviationType) {
  try {
    const session = await auth();
    if (!session) {
      redirect('/auth');
    }

    const collection = await dbc('deviations');
    const historyCollection = await dbc('deviations_history');

    const exists = await collection.findOne({
      articleNumber: deviation.articleNumber,
    });

    if (!exists) {
      return { error: 'not exists' };
    }

    // Save the old document in the deviations_history collection
    const { _id, ...documentWithoutId } = exists;
    await historyCollection.insertOne(documentWithoutId);

    const email = session.user.email;
    if (!email) {
      redirect('/auth');
    }
    deviation = {
      ...deviation,
      edited: { date: new Date(), email },
    };

    const res = await collection.updateOne(
      { articleNumber: deviation.articleNumber },
      { $set: deviation },
    );
    if (res) {
      revalidateTag('deviations');
      return { success: 'updated' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the deviation.');
  }
}
