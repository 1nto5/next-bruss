'use server';

import { dbc } from '@/lib/mongo';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function markAsRework(positions: string, reason: string) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('admin')) {
      redirect('/');
      return;
    }
    const collection = await dbc('scans');
    const positionsArray = positions.split('\n').map((line) => line.trim());
    const userEmail = session.user.email;

    const query = {
      $or: [
        { dmc: { $in: positionsArray } },
        { hydra_batch: { $in: positionsArray } },
        { pallet_batch: { $in: positionsArray } },
      ],
    };

    const update = {
      $set: {
        status: 'rework',
        rework_time: new Date(),
        rework_reason: reason,
        rework_user: userEmail,
      },
    };

    const result = await collection.updateMany(query, update);

    return { success: result.modifiedCount };
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while reworking the positions.');
  }
}
