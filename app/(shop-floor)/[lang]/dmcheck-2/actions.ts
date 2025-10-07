'use server';

import { dbc } from '@/lib/db/mongo';
import pgp from '@/lib/db/pg';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import type { ArticleConfigType } from './lib/types';
import type { LoginType } from './lib/zod';

async function getNextReworkAttempt(
  dmc: string,
  workplace: string,
): Promise<string> {
  const scansCollection = await dbc('scans');

  const existingReworks = await scansCollection
    .find({
      dmc,
      workplace,
      status: { $regex: /^rework\d+$/ },
    })
    .toArray();

  const reworkNumbers = existingReworks.map((record) => {
    const match = record.status.match(/^rework(\d+)$/);
    return match ? parseInt(match[1], 10) : 1;
  });

  const maxNumber = reworkNumbers.length > 0 ? Math.max(...reworkNumbers) : 0;
  return `rework${maxNumber + 1}`;
}

function isReworkStatus(status: string): boolean {
  return /^rework\d+$/.test(status);
}

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
    const articles = await coll.find({ workplace }).toArray();
    // Convert MongoDB documents to plain objects
    return articles.map((article) => ({
      id: article._id.toString(),
      workplace: article.workplace,
      articleNumber: article.articleNumber,
      articleName: article.articleName,
      articleNote: article.articleNote,
      piecesPerBox: article.piecesPerBox,
      pallet: article.pallet,
      boxesPerPallet: article.boxesPerPallet,
      dmc: article.dmc,
      dmcFirstValidation: article.dmcFirstValidation,
      secondValidation: article.secondValidation,
      dmcSecondValidation: article.dmcSecondValidation,
      hydraProcess: article.hydraProcess,
      ford: article.ford,
      bmw: article.bmw,
      requireDmcPartVerification: article.requireDmcPartVerification || false,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getArticleConfigById(articleConfigId: string) {
  try {
    const collection = await dbc('articles_config');
    const article = await collection.findOne({
      _id: new ObjectId(articleConfigId),
    });
    if (!article) return null;

    // Convert MongoDB document to plain object
    return {
      id: article._id.toString(),
      workplace: article.workplace,
      articleNumber: article.articleNumber,
      articleName: article.articleName,
      articleNote: article.articleNote,
      piecesPerBox: article.piecesPerBox,
      pallet: article.pallet,
      boxesPerPallet: article.boxesPerPallet,
      dmc: article.dmc,
      dmcFirstValidation: article.dmcFirstValidation,
      secondValidation: article.secondValidation,
      dmcSecondValidation: article.dmcSecondValidation,
      hydraProcess: article.hydraProcess,
      ford: article.ford,
      bmw: article.bmw,
      requireDmcPartVerification: article.requireDmcPartVerification || false,
    };
  } catch (error) {
    console.error(error);
    return null;
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

function createDmcValidationSchema(articleConfig: ArticleConfigType) {
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
          (articleConfig.dmcSecondValidation &&
            dmc
              .toLowerCase()
              .includes(articleConfig.dmcSecondValidation.toLowerCase())),
      ),
  });
}

export async function saveDmc(
  dmc: string,
  articleConfigId: string,
  operators: string[],
): Promise<{ message: string; dmc?: string; time?: string }> {
  try {
    const articlesConfigCollection = await dbc('articles_config');
    const articleConfigDoc = await articlesConfigCollection.findOne({
      _id: new ObjectId(articleConfigId),
    });
    if (!articleConfigDoc) {
      return { message: 'article not found' };
    }
    const articleConfig = {
      ...articleConfigDoc,
      id: articleConfigDoc._id.toString(),
    } as unknown as ArticleConfigType;

    const schema = createDmcValidationSchema(articleConfig);
    const parse = schema.safeParse({
      dmc: dmc,
    });

    if (!parse.success) {
      return { message: 'dmc not valid' };
    }
    const validatedDmc = parse.data.dmc;

    if (articleConfig.bmw) {
      if (!bmwDateValidation(validatedDmc)) {
        return { message: 'bmw date not valid' };
      }
    }

    if (articleConfig.ford) {
      if (!fordDateValidation(validatedDmc)) {
        return { message: 'ford date not valid' };
      }
    }

    const scansCollection = await dbc('scans');

    const existingDmc = await scansCollection.findOne(
      {
        dmc: validatedDmc,
        workplace: articleConfig.workplace,
      },
      { sort: { time: -1 } },
    );

    if (existingDmc && !isReworkStatus(existingDmc.status)) {
      return { message: 'dmc exists' };
    }

    // BRI 40040 check in external pg DB
    if (articleConfig.articleNumber.includes('40040')) {
      try {
        const pgc = await pgp.connect();
        await pgc.query('SET statement_timeout TO 3000');
        const res = await pgc.query(
          `SELECT haube_io FROM stationdichtheitspruefung WHERE id_haube = '${validatedDmc}'`,
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
      const url = `http://10.27.90.4:8025/api/part-status-plain/${validatedDmc}`;

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
      dmc: validatedDmc.toUpperCase(),
      workplace: articleConfig.workplace,
      article: articleConfig.articleNumber,
      operator: operators, // Always save as array
      time: new Date(),
    });

    if (insertResult) {
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
          dmc: validatedDmc,
          time: new Date().toISOString(),
        };
      }
      return {
        message: 'dmc saved',
        dmc: validatedDmc,
        time: new Date().toISOString(),
      };
    }
    return { message: 'save error' };
  } catch (error) {
    console.error(error);
    return { message: 'save error' };
  }
}

function extractQrValues(hydra: string) {
  const qrArticleMatch = hydra.match(/A:([^|]+)/);
  const qrQuantityMatch = hydra.match(/Q:([^|]+)/);
  const qrBatchMatch = hydra.match(/B:([^|]+)/);

  const qrArticle = qrArticleMatch ? qrArticleMatch[1].trim() : '';
  const qrQuantity = qrQuantityMatch ? parseInt(qrQuantityMatch[1], 10) : 0;
  const qrBatch = qrBatchMatch ? qrBatchMatch[1].trim() : '';

  // Additional validation - ensure we got valid values
  if (!qrArticle || !qrBatch || isNaN(qrQuantity) || qrQuantity <= 0) {
    return { qrArticle: '', qrQuantity: 0, qrBatch: '' };
  }

  return { qrArticle, qrQuantity, qrBatch };
}

export async function saveHydra(
  hydra: string,
  articleConfigId: string,
  operators: string[],
): Promise<{ message: string }> {
  try {
    const articlesConfigCollection = await dbc('articles_config');
    const articleConfig = await articlesConfigCollection.findOne({
      _id: new ObjectId(articleConfigId),
    });
    if (!articleConfig) {
      return { message: 'article not found' };
    }

    // Validate Hydra QR format - must contain pipe delimiters and specific fields
    const schema = z.object({
      hydra: z
        .string()
        .min(10, 'QR code too short')
        .refine(
          (val) => val.includes('|'),
          'Invalid QR format - missing delimiters',
        )
        .refine((val) => {
          // Check for required fields: A:, Q:, B:
          const hasArticle = val.toUpperCase().includes('A:');
          const hasQuantity = val.toUpperCase().includes('Q:');
          const hasBatch = val.toUpperCase().includes('B:');
          return hasArticle && hasQuantity && hasBatch;
        }, 'Invalid Hydra QR - missing required fields'),
    });
    const parse = schema.safeParse({ hydra });
    if (!parse.success) {
      return { message: 'qr not valid' };
    }
    const validatedHydra = parse.data.hydra;

    const { qrArticle, qrQuantity, qrBatch } = extractQrValues(
      validatedHydra.toUpperCase(),
    );

    // Check if extraction failed (invalid QR format)
    if (!qrArticle || qrQuantity === 0 || !qrBatch) {
      return { message: 'qr not valid' };
    }

    // For short Hydra QR codes, check if the QR article is contained in the config article number
    // or if the config article number starts with the QR article
    const isArticleMatch =
      qrArticle === articleConfig.articleNumber ||
      articleConfig.articleNumber.startsWith(qrArticle) ||
      articleConfig.articleNumber.includes(qrArticle);

    if (!isArticleMatch) {
      return { message: 'qr wrong article' };
    }

    if (qrQuantity !== articleConfig.piecesPerBox) {
      return { message: 'qr wrong quantity' };
    }

    const scansCollection = await dbc('scans');

    // Check if box is full before saving hydra
    const currentBoxCount = await scansCollection.countDocuments({
      article: articleConfig.articleNumber,
      workplace: articleConfig.workplace,
      status: 'box',
    });

    if (currentBoxCount !== articleConfig.piecesPerBox) {
      return { message: 'box not full' };
    }

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
          hydra_batch: qrBatch.toUpperCase(),
          hydra_operator: operators, // Separate field for hydra operator, don't overwrite original operator
          hydra_time: new Date(),
        },
      },
    );

    if (updateResult.modifiedCount > 0) {
      return { message: 'batch saved' };
    }
    return { message: 'save error' };
  } catch (error) {
    console.error(error);
    return { message: 'save error' };
  }
}

export async function savePallet(
  pallet: string,
  articleConfigId: string,
  operators: string[],
): Promise<{ message: string }> {
  try {
    const articlesConfigCollection = await dbc('articles_config');
    const articleConfig = await articlesConfigCollection.findOne({
      _id: new ObjectId(articleConfigId),
    });
    if (!articleConfig) {
      return { message: 'article not found' };
    }
    const schema = z.object({
      pallet: z.string().min(34),
    });
    const parse = schema.safeParse({ pallet });
    if (!parse.success) {
      return { message: 'qr not valid' };
    }
    const validatedPallet = parse.data.pallet.toUpperCase();

    const splitPalletQr = validatedPallet.split('|');

    const qrArticle =
      splitPalletQr[0].length === 7 && splitPalletQr[0].substring(2);

    if (qrArticle !== articleConfig.articleNumber) {
      return { message: 'qr wrong article' };
    }

    const qrQuantity =
      splitPalletQr[2] && parseInt(splitPalletQr[2].substring(2));
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

    // Check if pallet is full before saving pallet batch
    const currentBoxesOnPallet = await scansCollection
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

    if (currentBoxesOnPallet.length !== articleConfig.boxesPerPallet) {
      return { message: 'pallet not full' };
    }

    const existingBatch = await scansCollection.findOne({
      pallet_batch: qrBatch.toUpperCase(),
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
          pallet_batch: qrBatch.toUpperCase(),
          pallet_time: new Date(),
          pallet_operator: operators, // Always save as array
        },
      },
    );

    if (updateResult.modifiedCount > 0) {
      return { message: 'batch saved' };
    }
    return { message: 'save error' };
  } catch (error) {
    console.error(error);
    return { message: 'save error' };
  }
}

export async function saveDmcRework(
  dmc: string,
  articleConfigId: string,
  operators: string[],
): Promise<{ message: string; dmc?: string; time?: string }> {
  try {
    const articlesConfigCollection = await dbc('articles_config');
    const articleConfigDoc = await articlesConfigCollection.findOne({
      _id: new ObjectId(articleConfigId),
    });
    if (!articleConfigDoc) {
      return { message: 'article not found' };
    }
    const articleConfig = {
      ...articleConfigDoc,
      id: articleConfigDoc._id.toString(),
    } as unknown as ArticleConfigType;

    const schema = createDmcValidationSchema(articleConfig);
    const parse = schema.safeParse({
      dmc: dmc,
    });

    if (!parse.success) {
      return { message: 'dmc not valid' };
    }
    const validatedDmc = parse.data.dmc;

    const scansCollection = await dbc('scans');

    const existingDmc = await scansCollection.findOne(
      {
        dmc: validatedDmc,
        workplace: articleConfig.workplace,
      },
      { sort: { time: -1 } },
    );

    if (!existingDmc) {
      return { message: 'dmc not found' };
    }

    const nextReworkStatus = await getNextReworkAttempt(
      validatedDmc,
      articleConfig.workplace,
    );

    await scansCollection.updateOne(
      { _id: existingDmc._id },
      {
        $set: {
          status: nextReworkStatus,
          rework_time: new Date(),
          rework_reason: `workplace rework: ${articleConfig.workplace.toUpperCase()}`,
          rework_user: `personal number: ${operators.join(', ')}`,
        },
      },
    );

    // EOL810/EOL488 check in external SMART API
    if (
      articleConfig.workplace === 'eol810' ||
      articleConfig.workplace === 'eol488'
    ) {
      const url = `http://10.27.90.4:8025/api/part-status-plain/${validatedDmc}`;

      const res = await fetch(url);
      if (!res.ok || res.status === 404) {
        return { message: 'smart fetch error' };
      }
      const data = await res.text();
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
      dmc: validatedDmc.toUpperCase(),
      workplace: articleConfig.workplace,
      article: articleConfig.articleNumber,
      operator: operators,
      time: new Date(),
    });

    if (insertResult) {
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
      return {
        message: 'rework dmc saved',
        dmc: validatedDmc,
        time: new Date().toISOString(),
      };
    }
    return { message: 'save error' };
  } catch (error) {
    console.error(error);
    return { message: 'save error' };
  }
}

export async function save(
  articleConfigId: string,
  operators: string[],
  scanType: 'dmc' | 'hydra' | 'pallet',
  scanValue: string,
): Promise<{ message: string; dmc?: string; time?: string } | undefined> {
  if (!articleConfigId || !operators || !scanType || !scanValue) {
    return { message: 'missing data' };
  }

  switch (scanType) {
    case 'dmc':
      return await saveDmc(scanValue, articleConfigId, operators);
    case 'hydra':
      return await saveHydra(scanValue, articleConfigId, operators);
    case 'pallet':
      return await savePallet(scanValue, articleConfigId, operators);
    default:
      return { message: 'invalid scan type' };
  }
}

export async function getInBoxTableData(articleConfigId: string) {
  try {
    const scansCollection = await dbc('scans');
    const articleConfig = await getArticleConfigById(articleConfigId);
    if (!articleConfig) {
      return {
        piecesInBox: 0,
        boxIsFull: false,
      };
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
    return {
      piecesInBox: 0,
      boxIsFull: false,
    };
  }
}

export async function getBoxesOnPalletTableData(articleConfigId: string) {
  try {
    const scansCollection = await dbc('scans');
    const articleConfig = await getArticleConfigById(articleConfigId);
    if (!articleConfig) {
      return {
        boxesOnPallet: 0,
        palletIsFull: false,
      };
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
      palletIsFull: articleConfig.boxesPerPallet
        ? count >= articleConfig.boxesPerPallet
        : false,
    };
  } catch (error) {
    console.error(error);
    return {
      boxesOnPallet: 0,
      palletIsFull: false,
    };
  }
}

// Get list of DMC scans in box
export async function getBoxScans(articleConfigId: string) {
  try {
    const scansCollection = await dbc('scans');
    const articleConfig = await getArticleConfigById(articleConfigId);
    if (!articleConfig) {
      return [];
    }

    const scans = await scansCollection
      .find({
        article: articleConfig.articleNumber,
        workplace: articleConfig.workplace,
        status: 'box',
      })
      .sort({ time: -1 })
      .project({ dmc: 1, time: 1, _id: 0 })
      .toArray();

    return scans as { dmc: string; time: string }[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get list of HYDRA batches (boxes) on pallet
export async function getPalletBoxes(articleConfigId: string) {
  try {
    const scansCollection = await dbc('scans');
    const articleConfig = await getArticleConfigById(articleConfigId);
    if (!articleConfig) {
      return [];
    }

    const hydraScans = await scansCollection
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
            time: { $first: '$hydra_time' },
          },
        },
        {
          $project: {
            hydra: '$_id',
            time: 1,
            _id: 0,
          },
        },
        {
          $sort: { time: -1 },
        },
      ])
      .toArray();

    return hydraScans as { hydra: string; time: string }[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Delete DMC from box (set status to rework)
export async function deleteDmcFromBox(dmc: string, operators: string[]) {
  try {
    if (!dmc || !operators || operators.length === 0) {
      console.error('Invalid parameters for deleteDmcFromBox:', {
        dmc,
        operators,
      });
      return { message: 'invalid parameters' };
    }

    const scansCollection = await dbc('scans');

    // First check if the DMC exists in box status
    const existingDmc = await scansCollection.findOne({ dmc, status: 'box' });
    if (!existingDmc) {
      console.warn(`DMC ${dmc} not found in box status`);
      return { message: 'not found' };
    }

    const nextReworkStatus = await getNextReworkAttempt(
      dmc,
      existingDmc.workplace,
    );

    const result = await scansCollection.updateOne(
      { dmc, status: 'box' },
      {
        $set: {
          status: nextReworkStatus,
          rework_time: new Date(),
          rework_reason: 'deleted from box by operator',
          rework_user: `personal number: ${operators.join(', ')}`,
        },
      },
    );

    if (result.modifiedCount === 1) {
      return { message: 'deleted' };
    }

    console.error(`Failed to delete DMC ${dmc} - no documents modified`);
    return { message: 'update failed' };
  } catch (error) {
    console.error('Error in deleteDmcFromBox:', error);
    return { message: 'error' };
  }
}

// Delete HYDRA batch from pallet (set status to rework)
export async function deleteHydraFromPallet(
  hydra: string,
  operators: string[],
) {
  try {
    if (!hydra || !operators || operators.length === 0) {
      console.error('Invalid parameters for deleteHydraFromPallet:', {
        hydra,
        operators,
      });
      return { message: 'invalid parameters' };
    }

    const scansCollection = await dbc('scans');

    // First check if the HYDRA batch exists in pallet status
    const existingBatch = await scansCollection.findOne({
      hydra_batch: hydra,
      status: 'pallet',
    });
    if (!existingBatch) {
      console.warn(`HYDRA batch ${hydra} not found in pallet status`);
      return { message: 'not found' };
    }

    const palletDmcs = await scansCollection
      .find({ hydra_batch: hydra, status: 'pallet' })
      .toArray();

    let totalUpdated = 0;
    for (const dmcRecord of palletDmcs) {
      const nextReworkStatus = await getNextReworkAttempt(
        dmcRecord.dmc,
        dmcRecord.workplace,
      );

      const result = await scansCollection.updateOne(
        { _id: dmcRecord._id },
        {
          $set: {
            status: nextReworkStatus,
            rework_time: new Date(),
            rework_reason: 'deleted from pallet by operator',
            rework_user: `personal number: ${operators.join(', ')}`,
          },
        },
      );

      if (result.modifiedCount === 1) {
        totalUpdated++;
      }
    }

    const result = { modifiedCount: totalUpdated };

    if (result.modifiedCount > 0) {
      return { message: 'deleted' };
    }

    console.error(
      `Failed to delete HYDRA batch ${hydra} - no documents modified`,
    );
    return { message: 'update failed' };
  } catch (error) {
    console.error('Error in deleteHydraFromPallet:', error);
    return { message: 'error' };
  }
}

// Generate unique pallet QR code
export async function getPalletQr(articleConfigId: string) {
  try {
    const articlesConfigCollection = await dbc('articles_config');
    const articleConfig = await articlesConfigCollection.findOne({
      _id: new ObjectId(articleConfigId),
    });
    if (!articleConfig) {
      return null;
    }

    // Generate unique batch number by checking against existing batches
    let batch = '';
    let isUnique = false;
    const scansCollection = await dbc('scans');
    const scansArchiveCollection = await dbc('scans_archive');

    while (!isUnique) {
      batch = `AA${uuidv4().slice(0, 8).toUpperCase()}`;

      // Check if batch exists in scans collection
      const existingInScans = await scansCollection.findOne({
        pallet_batch: batch,
      });

      // Check if batch exists in scans_archive collection
      const existingInArchive = await scansArchiveCollection.findOne({
        pallet_batch: batch,
      });

      // If batch doesn't exist in either collection, it's unique
      if (!existingInScans && !existingInArchive) {
        isUnique = true;
      }
    }

    // Generate QR code string in the format expected by the system
    const totalQuantity =
      articleConfig.boxesPerPallet * articleConfig.piecesPerBox;
    return `A:${articleConfig.articleNumber}|O:669|Q:${totalQuantity}|B:${batch}|C:G`;
  } catch (error) {
    console.error('Error generating pallet QR:', error);
    return null;
  }
}
