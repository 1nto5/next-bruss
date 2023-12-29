'use server';

import clientPromise from '@/lib/mongo';

type Position = {
  article: string;
  status: string;
  workplace: string;
  type: string;
  count: string;
};

const collectionName = 'scans';

export async function searchPositions(
  searchTerm: string,
): Promise<(Position & { type: string })[]> {
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
        $addFields: {
          type: {
            $cond: [
              { $eq: ['$dmc', searchTerm] },
              'dmc',
              {
                $cond: [
                  { $eq: ['$hydra_batch', searchTerm] },
                  'hydra',
                  'pallet',
                ],
              },
            ],
          },
        },
      },

      {
        $group: {
          _id: {
            article: '$article',
            status: '$status',
            workplace: '$workplace',
            type: '$type',
          },
          dmc: { $addToSet: '$dmc' },
        },
      },
      {
        $project: {
          _id: 0,
          article: '$_id.article',
          status: '$_id.status',
          workplace: '$_id.workplace',
          type: '$_id.type',
          count: { $size: '$dmc' },
        },
      },
    ];

    const result = await collection.aggregate(aggregation).toArray();
    if (result.length === 0) return [];
    return result.map((item) => ({
      article: item.article,
      status: item.status,
      workplace: item.workplace,
      type: item.type,
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
      $and: [
        {
          $or: [
            { dmc: condition },
            { hydra_batch: condition },
            { pallet_batch: condition },
          ],
        },
        { status: { $ne: 'rework' } },
      ],
    };

    const update = {
      $set: {
        status: 'rework',
        rework_reason: reason,
      },
    };

    const result = await collection.updateMany(filter, update);
    return result.modifiedCount;
  } catch (error) {
    console.error(error);
    return 0;
  }
}
