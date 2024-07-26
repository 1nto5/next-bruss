'use server';

import { dbc } from '@/lib/mongo';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { DeviationType } from '@/lib/types/deviation';
import { ObjectId } from 'mongodb';

export async function deleteDraftDeviation(_id: ObjectId) {
  try {
    const session = await auth();
    if (!session) {
      redirect('/auth');
    }

    const collection = await dbc('deviations');

    const deviation = await collection.findOne({ _id: new ObjectId(_id) });

    if (!deviation) {
      return { error: 'not found' };
    }

    if (deviation.status !== 'draft') {
      return { error: 'not draft' };
    }

    const res = await collection.deleteOne({ _id: new ObjectId(_id) });
    if (res) {
      revalidateDeviations();
      return { success: 'deleted' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while deleting the deviation.');
  }
}

export async function revalidateDeviations() {
  revalidateTag('deviations');
}