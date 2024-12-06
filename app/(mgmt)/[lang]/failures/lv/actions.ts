'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { FailureType, InsertFailureType } from '@/lib/z/failure';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
// import { redirect } from 'next/navigation';

// export async function deleteDraftDeviation(_id: ObjectId) {
//   const session = await auth();
//   if (!session || !session.user?.email) {
//     return { error: 'unauthorized' };
//   }
//   try {
//     const collection = await dbc('deviations');

//     const deviation = await collection.findOne({ _id: new ObjectId(_id) });

//     if (!deviation) {
//       return { error: 'not found' };
//     }

//     if (deviation.status !== 'draft') {
//       return { error: 'not draft' };
//     }

//     if (deviation.owner !== session.user?.email) {
//       return { error: 'unauthorized' };
//     }

//     const res = await collection.deleteOne({ _id: new ObjectId(_id) });
//     if (res) {
//       revalidateFailures();
//       return { success: 'deleted' };
//     }
//   } catch (error) {
//     console.error(error);
//     throw new Error('deleteDraftDeviation server action error');
//   }
// }

export async function revalidateFailures() {
  revalidateTag('failures-lv');
}

export async function insertFailure(failureInsertData: InsertFailureType) {
  const session = await auth();
  // if (
  //   !session ||
  //   !session.user?.email ||
  //   !session.user?.roles.includes('failures-lv2')
  // ) {
  //   redirect('/auth');
  // }
  try {
    const collection = await dbc('failures_lv');
    const failureWithDate = {
      ...failureInsertData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const res = await collection.insertOne(failureWithDate);
    if (res) {
      revalidateTag('failures-lv');
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'insertDeviation server action error' };
  }
}
export async function updateFailure(failureUpdateData: FailureType) {
  try {
    const collection = await dbc('failures_lv');

    const { _id, createdAt, line, station, failure, ...updateFields } =
      failureUpdateData;
    updateFields.updatedAt = new Date();

    const res = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateFields },
    );

    if (res.matchedCount > 0) {
      revalidateTag('failures-lv');
      return { success: 'updated' };
    } else {
      return { error: 'not updated' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'updateFailure server action error' };
  }
}
