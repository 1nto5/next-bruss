'use server';

import { dbc } from '@/lib/mongo';
import pgp from '@/lib/pg';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// type FormStateType = {
//   message: string;
//   dmc?: string;
//   time?: string;
// };

export async function personLogin(
  prevState: {
    message: string;
  },
  formData: FormData,
) {
  const schema = z.object({
    personalNumber: z.string().min(1),
  });
  const parse = schema.safeParse({
    personalNumber: formData.get('personalNumber'),
  });
  if (!parse.success) {
    return { message: 'not valid' };
  }
  const data = parse.data;
  try {
    const collection = await dbc('persons');
    const person = await collection.findOne({
      personalNumber: data.personalNumber,
    });
    if (!person) {
      return { message: 'not exist' };
    }
    return { message: person._id.toString() };
  } catch (error) {
    console.error(error);
    throw new Error('personLogin server action error');
  }
}

export async function getArticlesForWorkplace(workplace: string) {
  try {
    const coll = await dbc('articles_config');
    return await coll.find({ workplace }).toArray();
  } catch (error) {
    console.error(error);
    throw new Error('getArticlesForWorkplace server action error');
  }
}

export async function getArticleConfigById(articleConfigId: string) {
  try {
    const collection = await dbc('articles_config');
    return await collection.findOne({ _id: new ObjectId(articleConfigId) });
  } catch (error) {
    console.error(error);
    throw new Error('getArticleConfigById server action error');
  }
}

export async function getOperatorById(operatorId: string) {
  try {
    const collection = await dbc('persons');
    return await collection.findOne({ _id: new ObjectId(operatorId) });
  } catch (error) {
    console.error(error);
    throw new Error('getOperatorById server action error');
  }
}

// FORD DATE VALIDATION
function fordDateValidation(dmc: string) {
  const today = new Date();
  const year = today.getFullYear();
  const start = new Date(year, 0, 0);
  const diff = today.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dotyGreg = Math.floor(diff / oneDay);
  const dotyJul = dotyGreg > 13 ? dotyGreg - 13 : 365 - 13 + dotyGreg;
  const dmcDotyJul = parseInt(dmc.substr(7, 3));
  // console.log(dotyJul, dmcDotyJul);
  return dmcDotyJul >= dotyJul - 7;
}

// BMW DATE VALIDATION
// function bmwDateValidation(dmc: string) {
//   const todayDate = parseInt(
//     new Date().toISOString().slice(2, 10).split('-').join(''),
//   );
//   const tomorrowDate = parseInt(
//     new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
//       .toISOString()
//       .slice(2, 10)
//       .split('-')
//       .join(''),
//   );
//   const yesterdayDate = parseInt(
//     new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
//       .toISOString()
//       .slice(2, 10)
//       .split('-')
//       .join(''),
//   );
//   const dayBeforeYesterdayDate = parseInt(
//     new Date(new Date().getTime() - 48 * 60 * 60 * 1000)
//       .toISOString()
//       .slice(2, 10)
//       .split('-')
//       .join(''),
//   );
//   const dmcDate = parseInt(dmc.slice(17, 23));
//   return (
//     dmcDate === todayDate ||
//     dmcDate === tomorrowDate ||
//     dmcDate === yesterdayDate ||
//     dmcDate === dayBeforeYesterdayDate
//   );
// }
function bmwDateValidation(dmc: string) {
  const today = new Date();
  const dmcDate = parseInt(dmc.slice(17, 23));
  for (let i = 0; i <= 30; i++) {
    const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const checkDateFormatted = parseInt(
      checkDate.toISOString().slice(2, 10).split('-').join(''),
    );
    if (dmcDate === checkDateFormatted) {
      return true;
    }
  }
  // preventing differences in time zones
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowDate = parseInt(
    tomorrow.toISOString().slice(2, 10).split('-').join(''),
  );
  if (dmcDate === tomorrowDate) {
    return true;
  }
  return false;
}

// save function for all types of scans - dmc, hydra, pallet - toasts are handled in the Scan component in the useEffect
export async function save(
  prevState: any,
  formData: FormData,
): Promise<{ message: string; dmc?: string; time?: string } | undefined> {
  if (formData.get('dmc')) {
    return await saveDmc(prevState, formData);
  }
  if (formData.get('hydra')) {
    return await saveHydra(prevState, formData);
  }
  if (formData.get('pallet')) {
    return await savePallet(prevState, formData);
  }
}

export async function saveDmc(
  prevState: any,
  formData: FormData,
): Promise<{ message: string; dmc?: string; time?: string } | undefined> {
  try {
    console.log(formData);
    const articleConfigId = formData.get('articleConfigId');
    const articlesConfigCollection = await dbc('articles_config');
    if (!articleConfigId || articleConfigId.toString().length !== 24) {
      return { message: 'wrong article config id' };
    }
    const articleConfig = await articlesConfigCollection.findOne({
      _id: new ObjectId(articleConfigId.toString()),
    });
    if (!articleConfig) {
      return { message: 'article not found' };
    }
    const schema = z.object({
      dmc: z
        .string()
        .length(articleConfig.dmc.length)
        .includes(articleConfig.dmcFirstValidation)
        .refine(
          (dmc) =>
            !articleConfig.secondValidation ||
            dmc.includes(articleConfig.dmcSecondValidation),
        ),
    });
    const parse = schema.safeParse({
      dmc: formData?.get('dmc')?.toString(),
    });

    if (!parse.success) {
      return { message: 'dmc not valid' };
    }
    const dmc = parse.data.dmc;

    if (articleConfig.bmw) {
      if (!bmwDateValidation(dmc)) {
        return { message: 'bmw date not valid' };
      }
    }

    if (articleConfig.ford) {
      if (!fordDateValidation(dmc)) {
        return { message: 'ford date not valid' };
      }
    }

    const scansCollection = await dbc('scans');

    const existingDmc = await scansCollection.findOne(
      {
        dmc: dmc,
        workplace: articleConfig.workplace,
      },
      { sort: { time: -1 } },
    );

    if (existingDmc && existingDmc.status !== 'rework') {
      return { message: 'dmc exists' };
    }

    // BRI 40040 check in external pg DB
    if (articleConfig.articleNumber === '40040') {
      try {
        const pgc = await pgp.connect();
        const res = await pgc.query(
          `SELECT haube_io FROM stationdichtheitspruefung WHERE id_haube = '${dmc}'`,
        );
        // console.log(res.rows[0].haube_io);
        if (res.rows.length === 0 || !res.rows[0].haube_io) {
          return { message: '40040 nok' };
        }
      } catch (error) {
        console.error('Failed to execute BRI pg query:', error);
        return { message: 'saving error' };
      }
    }

    // EOL810/EOL488 check in external SMART API
    if (
      articleConfig.workplace === 'eol810' ||
      articleConfig.workplace === 'eol488'
    ) {
      const url = `http://10.27.90.4:8025/api/part-status-plain/${dmc}`;

      const response = await fetch(url);
      if (!response.ok || response.status === 404) {
        return { message: 'smart fetch error' };
      }
      const data = await response.text();
      switch (data) {
        case 'NOT_FOUND':
          return { message: 'smart not found' };
        case 'UNKNOWN':
          return { message: 'smart unknown' };
        case 'NOK':
          return { message: 'smart nok' };
        case 'PATTERN':
          return { message: 'smart pattern' };
      }
    }

    const insertResult = await scansCollection.insertOne({
      status: 'box',
      dmc: dmc,
      workplace: articleConfig.workplace,
      type: articleConfig.type,
      article: articleConfig.articleNumber,
      operator: formData.get('operatorPersonalNumber'),
      time: new Date(),
    });

    if (insertResult) {
      revalidateTag('box');
      return { message: 'dmc saved', dmc: dmc, time: new Date().toISOString() };
    }
  } catch (error) {
    console.error(error);
    throw new Error('saveDmc server action error');
  }
}

export async function saveHydra(prevState: any, formData: FormData) {
  try {
    const articleConfigId = formData.get('articleConfigId');
    const articlesConfigCollection = await dbc('articles_config');
    if (!articleConfigId || articleConfigId.toString().length !== 24) {
      return { message: 'wrong article config id' };
    }
    const articleConfig = await articlesConfigCollection.findOne({
      _id: new ObjectId(articleConfigId.toString()),
    });
    if (!articleConfig) {
      return { message: 'article not found' };
    }

    const schema = z.object({
      hydra: z.string().min(34),
    });
    const parse = schema.safeParse({
      hydra: formData?.get('hydra')?.toString(),
    });
    if (!parse.success) {
      return { message: 'qr not valid' };
    }
    const hydra = parse.data.hydra;

    const splitHydraQr = hydra.split('|');

    const qrArticle = splitHydraQr[0].length === 7 && splitHydraQr[0].substr(2);

    if (qrArticle !== articleConfig.articleNumber) {
      return { message: 'qr wrong article' };
    }

    const qrQuantity = splitHydraQr[2] && parseInt(splitHydraQr[2].substr(2));
    if (qrQuantity !== articleConfig.piecesPerBox) {
      return { message: 'qr wrong quantity' };
    }

    const qrProcess = splitHydraQr[1] && splitHydraQr[1].substr(2);

    if (!articleConfig.hydraProcess.includes(qrProcess)) {
      return { message: 'qr wrong process' };
    }

    const qrBatch = splitHydraQr[3] && splitHydraQr[3].substr(2).toUpperCase();

    const scansCollection = await dbc('scans');
    const existingBatch = await scansCollection.findOne({
      hydra_batch: qrBatch,
    });

    if (existingBatch) {
      return { message: 'batch exists' };
    }

    const updateResult = await scansCollection.updateMany(
      {
        status: 'box',
        workplace: articleConfig.workplace,
        article: articleConfig.articleNumber,
      },
      {
        $set: {
          status: 'pallet',
          hydra_batch: qrBatch,
          operator: formData.get('operatorPersonalNumber'),
          hydra_time: new Date(),
        },
      },
    );

    if (updateResult.modifiedCount > 0) {
      revalidateTag('pallet');
      return { message: 'batch saved' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('saveHydra server action error');
  }
}

export async function getPalletQr(articleConfigId: string) {
  const articlesConfigCollection = await dbc('articles_config');
  const articleConfig = await articlesConfigCollection.findOne({
    _id: new ObjectId(articleConfigId.toString()),
  });
  if (!articleConfig) {
    return null;
  }
  return `A:${articleConfig.articleNumber}|O:669|Q:${articleConfig.boxesPerPallet * articleConfig.piecesPerBox}|B:AA${uuidv4()
    .slice(0, 8)
    .toUpperCase()}|C:G`;
}

export async function savePallet(prevState: any, formData: FormData) {
  try {
    const articleConfigId = formData.get('articleConfigId');
    const articlesConfigCollection = await dbc('articles_config');
    if (!articleConfigId || articleConfigId.toString().length !== 24) {
      return { message: 'wrong article config id' };
    }
    const articleConfig = await articlesConfigCollection.findOne({
      _id: new ObjectId(articleConfigId.toString()),
    });
    if (!articleConfig) {
      return { message: 'article not found' };
    }
    const schema = z.object({
      pallet: z.string().min(34),
    });
    const parse = schema.safeParse({
      pallet: formData?.get('pallet')?.toString(),
    });
    if (!parse.success) {
      return { message: 'qr not valid' };
    }
    const pallet = parse.data.pallet;

    const splitPalletQr = pallet.split('|');

    const qrArticle =
      splitPalletQr[0].length === 7 && splitPalletQr[0].substr(2);

    if (qrArticle !== articleConfig.articleNumber) {
      return { message: 'qr wrong article' };
    }

    const qrQuantity = splitPalletQr[2] && parseInt(splitPalletQr[2].substr(2));
    if (
      qrQuantity !==
      articleConfig.piecesPerBox * articleConfig.boxesPerPallet
    ) {
      return { message: 'qr wrong quantity' };
    }

    const qrProcess = splitPalletQr[1] && splitPalletQr[1].substr(2);

    if (!qrProcess.includes('669')) {
      return { message: 'qr wrong process' };
    }

    const qrBatch =
      splitPalletQr[3] && splitPalletQr[3].substr(2).toUpperCase();

    if (qrBatch.length !== 10) {
      return { message: 'qr not valid' };
    }

    const scansCollection = await dbc('scans');
    const existingBatch = await scansCollection.findOne({
      pallet_batch: qrBatch,
    });

    if (existingBatch) {
      return { message: 'batch exists' };
    }

    const updateResult = await scansCollection.updateMany(
      {
        status: 'pallet',
        workplace: articleConfig.workplace,
        article: articleConfig.articleNumber,
      },
      {
        $set: {
          status: 'warehouse',
          pallet_batch: qrBatch,
          pallet_time: new Date(),
          pallet_operator: formData.get('operatorPersonalNumber'),
        },
      },
    );

    if (updateResult.modifiedCount > 0) {
      revalidateTag('box');
      revalidateTag('pallet');
      return { message: 'batch saved' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('savePallet server action error');
  }
}

export async function getInBoxTableData(articleConfigId: string) {
  try {
    console.log('executing getInBoxTableData');
    const scansCollection = await dbc('scans');
    console.log(articleConfigId);
    const articleConfig = await getArticleConfigById(articleConfigId);
    if (!articleConfig) {
      throw new Error('getInBoxTableData server action error');
    }

    const scans = await scansCollection
      .find({
        article: articleConfig.articleNumber,
        status: 'box',
      })
      .sort({ time: -1 })
      .project({ dmc: 1, time: 1, _id: 0 })
      .toArray();

    return scans as { dmc: string; time: string }[];
  } catch (error) {
    console.error(error);
    throw new Error('getInBoxTableData server action error');
  }
}

export async function deleteDmcFromBox(dmc: string) {
  try {
    const scansCollection = await dbc('scans');
    const result = await scansCollection.updateOne(
      { dmc, status: 'box' },
      {
        $set: {
          status: 'rework',
          rework_time: new Date(),
          reworkReason: 'deleted from box by operator',
        },
      },
    );
    if (result.modifiedCount === 1) {
      revalidateTag('box');
      return { message: 'deleted' };
    }
    return { message: 'not found' };
  } catch (error) {
    console.error(error);
    throw new Error('deleteDmcFromBox server action error');
  }
}

export async function getBoxesOnPalletTableData(articleConfigId: string) {
  try {
    const scansCollection = await dbc('scans');
    const articleConfig = await getArticleConfigById(articleConfigId);
    if (!articleConfig) {
      throw new Error('getBoxesOnPalletTableData server action error');
    }

    const boxes = await scansCollection
      .aggregate([
        {
          $match: {
            article: articleConfig.articleNumber,
            status: 'pallet',
          },
        },
        {
          $group: {
            _id: '$hydra_batch',
            hydra_time: { $first: '$hydra_time' },
          },
        },
        {
          $project: {
            _id: 0,
            hydra_batch: '$_id',
            hydra_time: 1,
          },
        },
        {
          $sort: {
            hydra_time: -1,
          },
        },
      ])
      .toArray();

    return boxes as { hydra_batch: string; hydra_time: string }[];
  } catch (error) {
    console.error(error);
    throw new Error('getBoxesOnPalletTableData server action error');
  }
}

export async function deleteBoxFromPallet(hydra_batch: string) {
  try {
    const scansCollection = await dbc('scans');
    const result = await scansCollection.updateMany(
      { hydra_batch, status: 'pallet' },
      {
        $set: {
          status: 'rework',
          rework_time: new Date(),
          reworkReason: 'deleted from pallet by operator',
        },
      },
    );
    if (result.modifiedCount > 0) {
      revalidateTag('pallet');
      return { message: 'deleted' };
    }
    return { message: 'not found' };
  } catch (error) {
    console.error(error);
    throw new Error('deleteBoxFromPallet server action error');
  }
}
