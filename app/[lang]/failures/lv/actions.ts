'use server';

import { dbc } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { InsertFailureType, UpdateFailureType } from './lib/failures-types';

export async function revalidateFailures() {
  revalidateTag('failures-lv', 'max');
}

export async function insertFailure(failureInsertData: InsertFailureType) {
  try {
    const collection = await dbc('failures_lv');
    const failureWithDate = {
      ...failureInsertData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const res = await collection.insertOne(failureWithDate);
    if (res) {
      revalidateTag('failures-lv', 'max');
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'insertDeviation server action error' };
  }
}
export async function updateFailure(failureUpdateData: UpdateFailureType) {
  try {
    const collection = await dbc('failures_lv');
    const { _id, ...updateFields } = {
      ...failureUpdateData,
      updatedAt: new Date(),
    };

    const res = await collection.updateOne(
      { _id: new ObjectId(failureUpdateData._id) },
      { $set: updateFields },
    );

    if (res.matchedCount > 0) {
      revalidateTag('failures-lv', 'max');
      return { success: 'updated' };
    } else {
      return { error: 'not updated' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'updateFailure server action error' };
  }
}

export async function endFailure(id: string) {
  try {
    const collection = await dbc('failures_lv');

    const res = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          to: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    if (res.matchedCount > 0) {
      revalidateTag('failures-lv', 'max');
      return { success: 'ended' };
    }
    return { error: 'not ended' };
  } catch (error) {
    console.error(error);
    return { error: 'endFailure server action error' };
  }
}
