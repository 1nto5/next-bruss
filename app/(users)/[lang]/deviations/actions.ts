'use server';

import { dbc } from '@/lib/mongo';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { DeviationType } from '@/lib/types/deviation';

// export async function saveCapa(capa: CapaType) {
//   try {
//     const session = await auth();
//     if (!session || !(session.user.roles ?? []).includes('capa')) {
//       redirect('/auth');
//     }

//     const collection = await dbc('capa');
//     const historyCollection = await dbc('capa_history');

//     const exists = await collection.findOne({
//       articleNumber: capa.articleNumber,
//     });

//     if (!exists) {
//       return { error: 'not exists' };
//     }

//     // Save the old document in the capa_history collection
//     const { _id, ...documentWithoutId } = exists;
//     await historyCollection.insertOne(documentWithoutId);

//     const email = session.user.email;
//     if (!email) {
//       redirect('/auth');
//     }
//     capa = {
//       ...capa,
//       edited: { date: new Date(), email },
//     };

//     const res = await collection.updateOne(
//       { articleNumber: capa.articleNumber },
//       { $set: capa },
//     );
//     if (res) {
//       revalidateTag('capa');
//       return { success: 'updated' };
//     }
//   } catch (error) {
//     console.error(error);
//     throw new Error('An error occurred while saving the deviation.');
//   }
// }

// export async function getCapa(articleNumber: string): Promise<CapaType | null> {
//   try {
//     const collection = await dbc('capa');
//     const capa = (await collection.findOne(
//       { articleNumber },
//       { projection: { _id: 0 } },
//     )) as unknown as CapaType;
//     return capa;
//   } catch (error) {
//     console.error(error);
//     throw new Error('An error occurred while retrieving the deviation.');
//   }
// }

// TODO: change to deviation
export async function deleteDeviation(articleNumber: string) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('admin')) {
      redirect('/auth');
    }

    const collection = await dbc('deviations');

    const exists = await collection.findOne({ articleNumber });

    if (!exists) {
      return { error: 'not found' };
    }

    const res = await collection.deleteOne({ articleNumber });
    if (res) {
      revalidateTag('capa');
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
