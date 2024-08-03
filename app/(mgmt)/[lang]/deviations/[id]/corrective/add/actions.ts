'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { DeviationType } from '@/lib/types/deviation';
import { AddCorrectiveActionType } from '@/lib/z/deviation';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateCorrectiveAction(
  id: string,
  correctiveAction: AddCorrectiveActionType,
) {
  const session = await auth();
  if (!session || !session.user.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');
    const deviationToUpdate = await collection.findOne({
      _id: new ObjectId(id),
    });
    if (!deviationToUpdate) {
      return { error: 'not found' };
    }
    if (session.user.email !== deviationToUpdate.owner) {
      return { error: 'not authorized' };
    }

    const res = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          correctiveActions: [
            ...(deviationToUpdate.correctiveActions || []),
            {
              ...correctiveAction,
              added: {
                at: new Date(),
                by: session.user.email,
              },
              done: false,
            },
          ],
        },
      },
    );

    if (res) {
      revalidateTag('deviation');
      return { success: 'updated' };
    } else {
      return { error: 'not updated' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'updateCorrectiveAction server action error' };
  }
}

export async function redirectToDeviation(id: string) {
  redirect(`/deviations/${id}`);
}

export async function revalidateReasons() {
  revalidateTag('deviationReasons');
}
