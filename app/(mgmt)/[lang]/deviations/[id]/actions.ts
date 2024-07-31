'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { DeviationType } from '@/lib/types/deviation';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function findDeviation(id: string): Promise<DeviationType | null> {
  // const session = await auth();
  // if (!session || !session.user.email) {
  //   redirect('/auth');
  // }
  try {
    const collection = await dbc('deviations');
    const res = await collection.findOne({
      _id: new ObjectId(id),
    });
    if (res) {
      const { _id, ...deviation } = res;
      return { id: _id.toString(), ...deviation } as DeviationType;
    }

    return null;
  } catch (error) {
    console.error(error);
    throw new Error('findDeviation server action error');
  }
}

export async function redirectToDeviations() {
  redirect('/deviations');
}

export async function revalidateDeviations() {
  revalidateTag('deviations');
}
