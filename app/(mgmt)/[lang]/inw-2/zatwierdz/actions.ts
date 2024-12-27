'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { PositionZodType } from '@/lib/z/inventory';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
// import { redirect } from 'next/navigation';

export async function revalidateCards() {
  revalidateTag('inventory-cards');
}

export async function revalidatePositions() {
  revalidateTag('inventory-positions');
}

export async function revalidateAll() {
  revalidateTag('inventory-cards');
  revalidateTag('inventory-positions');
}

export async function updatePosition(
  identifier: string,
  data: PositionZodType,
) {
  try {
    // const timeout = (ms: number) =>
    //   new Promise((resolve) => setTimeout(resolve, ms));
    // await timeout(2000);

    const collection = await dbc('inventory_cards');

    const [card, position] = identifier.split('/');

    const positionData = {
      time: new Date(),
      articleNumber: data.articleNumber,
      articleName: data.articleName,
      quantity: data.quantity,
      wip: data.wip,
      comment: data.comment,
    };
    const res = await collection.updateOne(
      {
        'number': card,
        'positions.position': position,
      },
      {
        $set: { 'positions.$': positionData },
      },
    );

    if (res.matchedCount > 0) {
      revalidateTag('inventory-card-positions');
      return { success: 'updated' };
    } else {
      return { error: 'not updated' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'updatePosition server action error' };
  }
}
