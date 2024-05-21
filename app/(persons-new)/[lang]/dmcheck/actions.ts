'use server';

import { dbc } from '@/lib/mongo';
import pgp from '@/lib/pg';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

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
    throw new Error('An error occurred during the login process.');
  }
}

export async function getArticlesConfigForWorkplace(workplace: string) {
  const collection = await dbc('articles_config');
  return await collection.find({ workplace }).toArray();
}

export async function getArticleConfigById(articleConfigId: string) {
  const collection = await dbc('articles_config');
  return await collection.findOne({ _id: new ObjectId(articleConfigId) });
}

export async function getOperatorById(operatorId: string) {
  const collection = await dbc('persons');
  return await collection.findOne({ _id: new ObjectId(operatorId) });
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
function bmwDateValidation(dmc: string) {
  const todayDate = parseInt(
    new Date().toISOString().slice(2, 10).split('-').join(''),
  );
  const tomorrowDate = parseInt(
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(2, 10)
      .split('-')
      .join(''),
  );
  const yesterdayDate = parseInt(
    new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(2, 10)
      .split('-')
      .join(''),
  );
  const dayBeforeYesterdayDate = parseInt(
    new Date(new Date().getTime() - 48 * 60 * 60 * 1000)
      .toISOString()
      .slice(2, 10)
      .split('-')
      .join(''),
  );
  const dmcDate = parseInt(dmc.slice(17, 23));
  return (
    dmcDate === todayDate ||
    dmcDate === tomorrowDate ||
    dmcDate === yesterdayDate ||
    dmcDate === dayBeforeYesterdayDate
  );
}

function convertDmcForBriApi(dmc: string) {
  const formattedDmc = dmc
    .replace(/#/g, '%23')
    .replace(/\*/g, '%2A')
    .replace(/=/g, '%3D')
    .replace(/ /g, '%20');

  const currentYear = new Date().getFullYear();
  const yearCode = currentYear.toString().slice(2);
  const formattedDmcWithYear = `%${yearCode}${formattedDmc}`;

  return formattedDmcWithYear;
}

// save function for all types of scans - dmc, hydra, pallet - toasts are handled in the Scan component in the useEffect
export async function save(prevState: any, formData: FormData) {
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

export async function saveDmc(prevState: any, formData: FormData) {
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

    // TODO: BRI 40040 check in external DB
    // if (articleConfig.articleNumber === '40040') {
    //   try {
    //     const pgc = await pgp.connect();
    //     // const result = await pgc.query(
    //     //   `SELECT * FROM stationdichtheitspruefung ORDER BY id DESC LIMIT 10`,
    //     // );
    //     const result = await pgc.query(`SELECT NOW() as current_time`);
    //     console.log(result.rows[0].current_time);
    //     return { message: 'test' };
    //   } catch (error) {}
    // }

    if (articleConfig.articleNumber === '40040') {
      try {
        const pgc = await pgp.connect();
        // Query to select the id_haube column from stationdichtheitspruefung
        // You might want to specify more conditions or limit the rows if necessary
        const result = await pgc.query(
          `SELECT haube_io FROM stationdichtheitspruefung WHERE id_haube = '#05L103469D  ###*1BE DBB66J1BK2Z*='`,
        );
        const haube = await pgc.query(
          `SELECT * FROM stationdichtheitspruefung ORDER BY id_haube DESC LIMIT 1`,
        );
        console.log(haube.rows[0]);
        console.log(result.rows[0].haube_io);
        return { message: 'test' };
      } catch (error) {
        console.error('Failed to execute query:', error);
        return { message: 'test' };
      }
    }

    const scansCollection = await dbc('scans');

    const existingDmc = await scansCollection.findOne({
      dmc: dmc,
      workplace: articleConfig.workplace,
    });
    if (existingDmc) {
      return { message: 'dmc exists' };
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
      return { message: 'dmc saved' };
    }
  } catch (error) {
    console.error(error);
    return { message: 'saving error' };
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
    return { message: 'saving error' };
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
    return { message: 'saving error' };
  }
}
