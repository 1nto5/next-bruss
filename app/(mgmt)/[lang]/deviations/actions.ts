'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
// import { redirect } from 'next/navigation';

export async function deleteDraftDeviation(_id: string) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return { error: 'unauthorized' };
  }
  try {
    const collection = await dbc('deviations');

    const deviation = await collection.findOne({ _id: new ObjectId(_id) });

    if (!deviation) {
      return { error: 'not found' };
    }

    if (deviation.status !== 'draft') {
      return { error: 'not draft' };
    }

    if (deviation.owner !== session.user?.email) {
      return { error: 'unauthorized' };
    }

    const res = await collection.deleteOne({ _id: new ObjectId(_id) });
    if (res) {
      revalidateDeviations();
      return { success: 'deleted' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('deleteDraftDeviation server action error');
  }
}

export async function revalidateDeviations() {
  revalidateTag('deviations');
}
