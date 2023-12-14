'use server';

import clientPromise from '@/lib/mongo';

type Position = {
  article: string;
  status: string;
  workplace: string;
  count: string;
};

const collectionName = 'scans';

export async function searchPositions(searchTerm: string): Promise<Position[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    const aggregation = [
      {
        $match: {
          $or: [
            { dmc: searchTerm },
            { hydra_batch: searchTerm },
            { pallet_batch: searchTerm },
          ],
        },
      },
      {
        $group: {
          _id: {
            article: '$article',
            status: '$status',
            workplace: '$workplace',
          },
          count: { $sum: 1 }, // Zliczanie dokumentów dla każdej grupy
        },
      },
      {
        $project: {
          _id: 0,
          article: '$_id.article',
          status: '$_id.status',
          workplace: '$_id.workplace',
          count: 1, // Włączenie liczby dokumentów w wyniku
        },
      },
    ];

    const result = await collection.aggregate(aggregation).toArray();
    // console.log(result);
    if (result.length === 0) return [];
    return result.map((item) => ({
      article: item.article,
      status: item.status,
      workplace: item.workplace,
      count: item.count,
    }));
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while searching for positions.');
  }
}
export async function setReworkStatus(
  condition: string,
  reason: string,
): Promise<number> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    const filter = {
      $or: [
        { dmc: condition },
        { hydra_batch: condition },
        { pallet_batch: condition },
      ],
    };

    const update = {
      $set: {
        status: 'rework',
        reason: reason,
      },
    };

    const result = await collection.updateMany(filter, update);
    return result.modifiedCount;
  } catch (error) {
    console.error(error);
    return 0;
  }
}
