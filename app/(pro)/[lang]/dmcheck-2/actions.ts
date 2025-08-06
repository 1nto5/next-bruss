'use server';

import { dbc } from '@/lib/mongo';
import pgp from '@/lib/pg';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import type { LoginType } from './lib/zod';

export async function login(data: LoginType) {
  try {
    const collection = await dbc('employees');
    let operator1 = null;
    let operator2 = null;
    let operator3 = null;

    const person1 = await collection.findOne({
      identifier: data.identifier1,
    });
    if (!person1) {
      return { error: 'wrong number 1' };
    }
    operator1 = {
      identifier: person1.identifier,
      firstName: person1.firstName,
      lastName: person1.lastName,
    };

    if (data.identifier2) {
      const person2 = await collection.findOne({
        identifier: data.identifier2,
      });
      if (!person2) {
        return { error: 'wrong number 2' };
      }
      operator2 = {
        identifier: person2.identifier,
        firstName: person2.firstName,
        lastName: person2.lastName,
      };
    }

    if (data.identifier3) {
      const person3 = await collection.findOne({
        identifier: data.identifier3,
      });
      if (!person3) {
        return { error: 'wrong number 3' };
      }
      operator3 = {
        identifier: person3.identifier,
        firstName: person3.firstName,
        lastName: person3.lastName,
      };
    }

    return {
      success: true,
      operator1,
      operator2,
      operator3,
    };
  } catch (error) {
    console.error(error);
    return { error: 'login error' };
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

// FORD DATE VALIDATION
function fordDateValidation(dmc: string) {
  const today = new Date();
  const year = today.getFullYear();
  const start = new Date(year, 0, 0);
  const diff = today.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dotyGreg = Math.floor(diff / oneDay);
  const dotyJul = dotyGreg > 13 ? dotyGreg - 13 : 365 - 13 + dotyGreg;
  const dmcDotyJul = parseInt(dmc.substring(7, 10));
  return dmcDotyJul >= dotyJul - 7;
}

// BMW DATE VALIDATION
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
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowDate = parseInt(
    tomorrow.toISOString().slice(2, 10).split('-').join(''),
  );
  if (dmcDate === tomorrowDate) {
    return true;
  }
  return false;
}

function createDmcValidationSchema(articleConfig: any) {
  return z.object({
    dmc: z
      .string()
      .length(articleConfig.dmc.length)
      .refine((dmc) =>
        dmc
          .toLowerCase()
          .includes(articleConfig.dmcFirstValidation.toLowerCase()),
      )
      .refine(
        (dmc) =>
          !articleConfig.secondValidation ||
          dmc
            .toLowerCase()
            .includes(articleConfig.dmcSecondValidation.toLowerCase()),
      ),
  });
}

export async function saveDmc(
  _prevState: any,
  formData: FormData,
): Promise<{ message: string; dmc?: string; time?: string } | undefined> {
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

    const schema = createDmcValidationSchema(articleConfig);
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
    if (articleConfig.articleNumber.includes('40040')) {
      try {
        const pgc = await pgp.connect();
        await pgc.query('SET statement_timeout TO 3000');
        const res = await pgc.query(
          `SELECT haube_io FROM stationdichtheitspruefung WHERE id_haube = '${dmc}'`,
        );
        pgc.release();
        if (res.rows.length === 0 || !res.rows[0].haube_io) {
          return { message: '40040 nok' };
        }
      } catch (error) {
        console.error('Failed to execute BRI pg query:', error);
        return { message: 'bri pg saving error' };
      }
    }

    let smartStatus = 'ok';

    // EOL810/EOL488 check in external SMART API
    if (
      articleConfig.workplace === 'eol810' ||
      articleConfig.workplace === 'eol488'
    ) {
      const url = `http://10.27.90.4:8025/api/part-status-plain/${dmc}`;

      const res = await fetch(url);
      if (!res.ok || res.status === 404) {
        return { message: 'smart fetch error' };
      }
      const data = await res.text();
      switch (data) {
        case 'NOT_FOUND':
          return { message: 'smart not found' };
        case 'UNKNOWN':
          smartStatus = 'unknown';
          break;
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
      article: articleConfig.articleNumber,
      operator: formData.get('operatorPersonalNumber'),
      time: new Date(),
    });

    if (insertResult) {
      revalidateTag('box');
      // EOL810/EOL488 lighting the lamp
      if (
        articleConfig.workplace === 'eol810' ||
        articleConfig.workplace === 'eol488'
      ) {
        const variant = articleConfig.workplace === 'eol810' ? '10' : '20';
        await fetch(
          `http://10.27.90.4:8090/api/turn-on-ok-indicator/${variant}`,
        );
      }
      if (smartStatus === 'unknown') {
        return {
          message: 'dmc saved smart unknown',
          dmc: dmc,
          time: new Date().toISOString(),
        };
      }
      return { message: 'dmc saved', dmc: dmc, time: new Date().toISOString() };
    }
  } catch (error) {
    console.error(error);
    throw new Error('saveDmc server action error');
  }
}

function extractQrValues(hydra: string) {
  const qrArticleMatch = hydra.match(/A:([^|]+)/);
  const qrQuantityMatch = hydra.match(/Q:([^|]+)/);
  const qrBatchMatch = hydra.match(/B:([^|]+)/);

  const qrArticle = qrArticleMatch ? qrArticleMatch[1] : '';
  const qrQuantity = qrQuantityMatch ? parseInt(qrQuantityMatch[1], 10) : 0;
  const qrBatch = qrBatchMatch ? qrBatchMatch[1] : '';

  return { qrArticle, qrQuantity, qrBatch };
}

export async function saveHydra(_prevState: any, formData: FormData) {
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
      hydra: z.string(),
    });
    const parse = schema.safeParse({
      hydra: formData?.get('hydra')?.toString(),
    });
    if (!parse.success) {
      return { message: 'qr not valid' };
    }
    const hydra = parse.data.hydra;

    let qrBatch;

    const {
      qrArticle,
      qrQuantity,
      qrBatch: extractedBatch,
    } = extractQrValues(hydra.toUpperCase());

    if (qrArticle !== articleConfig.articleNumber) {
      return { message: 'qr wrong article' };
    }

    if (qrQuantity !== articleConfig.piecesPerBox) {
      return { message: 'qr wrong quantity' };
    }

    qrBatch = extractedBatch;

    if (!qrBatch) {
      return { message: 'qr not valid' };
    }

    const scansCollection = await dbc('scans');

    if (!articleConfig.nonUniqueHydraBatch) {
      const existingBatch = await scansCollection.findOne({
        hydra_batch: qrBatch,
      });

      if (existingBatch) {
        return { message: 'batch exists' };
      }
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

export async function savePallet(_prevState: any, formData: FormData) {
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
    const pallet = parse.data.pallet.toUpperCase();

    const splitPalletQr = pallet.split('|');

    const qrArticle =
      splitPalletQr[0].length === 7 && splitPalletQr[0].substring(2);

    if (qrArticle !== articleConfig.articleNumber) {
      return { message: 'qr wrong article' };
    }

    const qrQuantity = splitPalletQr[2] && parseInt(splitPalletQr[2].substring(2));
    if (
      qrQuantity !==
      articleConfig.piecesPerBox * articleConfig.boxesPerPallet
    ) {
      return { message: 'qr wrong quantity' };
    }

    const qrProcess = splitPalletQr[1] && splitPalletQr[1].substring(2);

    if (!qrProcess.includes('669')) {
      return { message: 'qr wrong process' };
    }

    const qrBatch =
      splitPalletQr[3] && splitPalletQr[3].substring(2).toUpperCase();

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

export async function getInBoxTableData(articleConfigId: string) {
  try {
    const scansCollection = await dbc('scans');
    const articleConfig = await getArticleConfigById(articleConfigId);
    if (!articleConfig) {
      throw new Error('getInBoxTableData server action error');
    }

    const count = await scansCollection.countDocuments({
      article: articleConfig.articleNumber,
      workplace: articleConfig.workplace,
      status: 'box',
    });

    return {
      piecesInBox: count,
      boxIsFull: count >= articleConfig.piecesPerBox,
    };
  } catch (error) {
    console.error(error);
    throw new Error('getInBoxTableData server action error');
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
            workplace: articleConfig.workplace,
            status: 'pallet',
          },
        },
        {
          $group: {
            _id: '$hydra_batch',
          },
        },
      ])
      .toArray();

    const count = boxes.length;

    return {
      boxesOnPallet: count,
      palletIsFull: count >= (articleConfig.boxesPerPallet || 0),
    };
  } catch (error) {
    console.error(error);
    throw new Error('getBoxesOnPalletTableData server action error');
  }
}