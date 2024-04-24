'use server';

import { dbc } from '@/lib/mongo';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';

type CapaType = {
  client: string;
  line: string;
  articleNumber: string;
  articleName: string;
  clientPartNumber: string;
  piff: string;
  processDescription: string;
  rep160t?: string;
  rep260t?: string;
  rep260t2k?: string;
  rep300t?: string;
  rep300t2k?: string;
  rep400t?: string;
  rep500t?: string;
  b50?: string;
  b85?: string;
  engel?: string;
  eol?: string;
  cutter?: string;
  other?: string;
  soldCapa?: string;
  flex?: string;
  possibleMax?: string;
  comment?: string;
  sop?: string;
  eop?: string;
  service?: string;
  edited?: { date: Date | string; email: string };
};

export async function addCapa(capa: CapaType) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('capa')) {
      redirect('/auth');
    }

    const collection = await dbc('capa');

    const exists = await collection.findOne({
      articleNumber: capa.articleNumber,
    });

    if (exists) {
      return { error: 'exists' };
    }

    const email = session.user.email;
    if (!email) {
      redirect('/auth');
    }

    capa = { ...capa, edited: { date: new Date(), email } };

    const res = await collection.insertOne(capa);
    if (res) {
      revalidateTag('capa');
      return { success: 'inserted' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the CAPA.');
  }
}

export async function saveCapa(capa: CapaType) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('capa')) {
      redirect('/auth');
    }

    const collection = await dbc('capa');
    const historyCollection = await dbc('capa_history');

    const exists = await collection.findOne({
      articleNumber: capa.articleNumber,
    });

    if (!exists) {
      return { error: 'not exists' };
    }

    // Save the old document in the capa_history collection
    await historyCollection.insertOne(exists);

    const email = session.user.email;
    if (!email) {
      redirect('/auth');
    }
    capa = {
      ...capa,
      edited: { date: new Date(), email },
    };

    const res = await collection.updateOne(
      { articleNumber: capa.articleNumber },
      { $set: capa },
    );
    if (res) {
      revalidateTag('capa');
      return { success: 'updated' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the CAPA.');
  }
}

export async function getCapa(articleNumber: string): Promise<CapaType | null> {
  try {
    const collection = await dbc('capa');
    const capa = (await collection.findOne(
      { articleNumber },
      { projection: { _id: 0 } },
    )) as unknown as CapaType;
    return capa;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while retrieving the CAPA.');
  }
}

export async function deleteCapa(articleNumber: string) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('capa')) {
      redirect('/auth');
    }

    const collection = await dbc('capa');

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
    throw new Error('An error occurred while deleting the CAPA.');
  }
}

export async function revalidateCapa() {
  revalidateTag('capa');
}
