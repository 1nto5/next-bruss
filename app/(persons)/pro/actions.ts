'use server';
import clientPromise from '@/lib/mongo';
import config from '@/app/(persons)/pro/config';
import generatePalletQr from '@/app/(persons)/pro/lib/utils/generatePalletQr';
import {
  fordValidation,
  bmwValidation,
} from '@/app/(persons)/pro/lib/utils/dmcDateValidation';

type ArticleConfig = {
  article: string;
  type: string;
  name: string;
  baseDmc: string;
  boxSize: number | number[];
  hydraProc: string;
};

const collectionName = 'scans';

export async function loginPerson(number: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('persons');
    const person = await collection.findOne({ personalNumber: number });
    if (!person) {
      return null;
    }
    return person.name;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred during the login process.');
  }
}

export async function countInBox(workplace: string, article: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    const count = await collection.countDocuments({
      status: 'box',
      workplace: workplace,
      article: article,
    });
    return count;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while counting the documents.');
  }
}

export async function saveDmc(
  dmc: string,
  workplace: string,
  article: string,
  operator: string,
  boxSize: number,
) {
  try {
    const articleConfig = config.find(
      (object: ArticleConfig) => object.article === article,
    );
    if (!articleConfig || !articleConfig.baseDmc) {
      throw new Error('Article config problem!');
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    const existingData = await collection.findOne({ dmc: dmc });

    if (existingData && existingData.status !== 'rework') {
      return { status: 'exists' };
    }

    const isDmcValid = dmc.includes(articleConfig.baseDmc);
    if (!isDmcValid) {
      return { status: 'invalid' };
    }

    const [inBox] = await Promise.all([countInBox(workplace, article)]);

    if (!boxSize) {
      throw new Error('Box size not found.');
    }

    if (inBox >= boxSize) {
      return { status: 'full box' };
    }

    const insertResult = await collection.insertOne({
      status: 'box',
      dmc: dmc,
      workplace: workplace,
      type: articleConfig.type,
      article: article,
      operator: operator,
      time: new Date(),
    });
    if (insertResult) {
      return { status: 'saved' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the DMC.');
  }
}

export async function saveHydraBatch(
  hydraQr: string,
  workplace: string,
  article: string,
  operator: string,
  boxSize: number,
) {
  try {
    const articleConfig = config.find(
      (object: ArticleConfig) => object.article === article,
    );
    if (!articleConfig) {
      throw new Error('Article config problem!');
    }
    if (hydraQr.length < 34 || !hydraQr.includes('|')) {
      return { status: 'invalid' };
    }
    const splitHydraQr = hydraQr.split('|');
    const qrarticle = splitHydraQr[0].length === 7 && splitHydraQr[0].substr(2);
    if (qrarticle !== article) {
      return { status: 'wrong article' };
    }
    const qrQuantity = splitHydraQr[2] && parseInt(splitHydraQr[2].substr(2));
    if (qrQuantity !== boxSize) {
      return { status: 'wrong quantity' };
    }
    const qrProcess = splitHydraQr[1] && splitHydraQr[1].substr(2);
    if (!articleConfig.hydraProc.includes(qrProcess)) {
      return { status: 'wrong process' };
    }
    const qrBatch = splitHydraQr[3] && splitHydraQr[3].substr(2).toUpperCase();
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    const existingBatch = await collection.findOne({ hydra_batch: qrBatch });
    if (existingBatch) {
      return { status: 'exists' };
    }

    const existingData = await collection.findOne({
      workplace: workplace,
      article: article,
    });
    if (existingData) {
      const updateResult = await collection.updateMany(
        { status: 'box', workplace: workplace, article: article },
        {
          $set: {
            status: 'pallet',
            hydra_batch: qrBatch,
            hydra_operator: operator,
            hydra_time: new Date(),
          },
        },
      );
      if (updateResult.modifiedCount > 0) {
        return { status: 'saved' };
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the hydra batch.');
  }
}
