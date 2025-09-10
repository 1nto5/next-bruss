'use server';
import config from '@/app/(pro-old)/[lang]/pro/config';
import {
  bmwValidation,
  fordValidation,
} from '@/app/(pro-old)/[lang]/pro/lib/utils/dmcDateValidation';
import generatePalletQr from '@/app/(pro-old)/[lang]/pro/lib/utils/generatePalletQr';
import clientPromise from '@/lib/mongo';

type ArticleConfig = {
  article: string;
  workplace: string;
  type: string;
  name: string;
  note?: string;
  baseDmc?: string;
  dmcFirVal?: number[];
  dmcSecVal?: number[];
  ford?: boolean;
  bmw?: boolean;
  palletSize?: number;
  boxSize: number;
  hydraProc: string;
  palletProc?: string;
};

const collectionName = 'scans_no_dmc';

export async function loginPerson(number: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('employees');
    const person = await collection.findOne({ identifier: number });
    if (!person) {
      return null;
    }
    return person.firstName + ' ' + person.lastName;
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

export async function countQuantityOnPallet(
  workplace: string,
  article: string,
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    const count = await collection.countDocuments({
      status: 'pallet',
      workplace: workplace,
      article: article,
    });
    if (workplace === 'eol136153') {
      const articleConfig = config.find(
        (object: ArticleConfig) =>
          object.workplace === workplace && object.article === article,
      );
      if (!articleConfig || !articleConfig.boxSize) {
        throw new Error('Article config problem!');
      }
      return count * articleConfig.boxSize;
    }
    return count;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while counting the documents.');
  }
}

export async function getPalletSize(workplace: string, article: string) {
  try {
    const articleConfig = config.find(
      (object: ArticleConfig) =>
        object.workplace === workplace && object.article === article,
    );
    return articleConfig ? articleConfig.palletSize : null;
  } catch (error) {
    console.error('Error while getting the pallet size:', error);
    return null;
  }
}

export async function countBoxesOnPallet(workplace: string, article: string) {
  try {
    const articleConfig = config.find(
      (object: ArticleConfig) =>
        object.workplace === workplace && object.article === article,
    );
    if (!articleConfig || !articleConfig.boxSize) {
      throw new Error('Article config problem!');
    }
    const count = await countQuantityOnPallet(workplace, article);
    return count / articleConfig.boxSize;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while counting the documents.');
  }
}

export async function getBoxSize(workplace: string, article: string) {
  try {
    const articleConfig = config.find(
      (object: ArticleConfig) =>
        object.workplace === workplace && object.article === article,
    );
    return articleConfig ? articleConfig.boxSize : null;
  } catch (error) {
    console.error('Error while getting the box size:', error);
    return null;
  }
}

export async function saveDmc(
  dmc: string,
  workplace: string,
  article: string,
  operator: string,
) {
  try {
    const articleConfig = config.find(
      (object: ArticleConfig) =>
        object.workplace === workplace && object.article === article,
    );
    if (!articleConfig || !articleConfig.baseDmc || !articleConfig.dmcFirVal) {
      throw new Error('Article config problem!');
    }
    if (dmc.length !== articleConfig.baseDmc.length) {
      return { status: 'invalid' };
    }
    if (
      dmc.substring(articleConfig.dmcFirVal[0], articleConfig.dmcFirVal[1]) !==
      articleConfig.baseDmc.substring(
        articleConfig.dmcFirVal[0],
        articleConfig.dmcFirVal[1],
      )
    ) {
      return { status: 'invalid' };
    }
    if (
      articleConfig.dmcSecVal &&
      dmc.substring(articleConfig.dmcSecVal[0], articleConfig.dmcSecVal[1]) !==
        articleConfig.baseDmc.substring(
          articleConfig.dmcSecVal[0],
          articleConfig.dmcSecVal[1],
        )
    ) {
      return { status: 'invalid' };
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    const existingData = await collection.findOne({ dmc: dmc });
    console.log(existingData?.status);
    if (
      existingData?.status !== 'rework' &&
      articleConfig.bmw &&
      !bmwValidation(dmc)
    ) {
      return { status: 'wrong date' };
    }
    if (
      existingData?.status !== 'rework' &&
      articleConfig.ford &&
      !fordValidation(dmc)
    ) {
      return { status: 'wrong date' };
    }
    if (existingData && existingData.status !== 'rework') {
      return { status: 'exists' };
    }

    // skip it if you want to save DMC faster
    if (articleConfig.palletSize) {
      const [boxesOnPallet, palletSize, inBox, boxSize] = await Promise.all([
        countBoxesOnPallet(workplace, article),
        getPalletSize(workplace, article),
        countInBox(workplace, article),
        getBoxSize(workplace, article),
      ]);

      if (!palletSize) {
        throw new Error('Pallet size not found.');
      }
      if (boxesOnPallet >= palletSize) {
        return { status: 'full pallet' };
      }
      if (!boxSize) {
        throw new Error('Box size not found.');
      }
      if (inBox >= boxSize) {
        return { status: 'full box' };
      }
    } else {
      const [inBox, boxSize] = await Promise.all([
        countInBox(workplace, article),
        getBoxSize(workplace, article),
      ]);

      if (!boxSize) {
        throw new Error('Box size not found.');
      }
      if (inBox >= boxSize) {
        return { status: 'full box' };
      }
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
) {
  try {
    const articleConfig = config.find(
      (object: ArticleConfig) =>
        object.workplace === workplace && object.article === article,
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
    if (qrQuantity !== articleConfig.boxSize) {
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
    if (articleConfig.palletSize) {
      const [boxesOnPallet, palletSize] = await Promise.all([
        countBoxesOnPallet(workplace, article),
        getPalletSize(workplace, article),
      ]);

      if (!palletSize) {
        throw new Error('Pallet size not found.');
      }
      if (boxesOnPallet >= palletSize) {
        return { status: 'full pallet' };
      }
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

export async function getPalletQr(workplace: string, article: string) {
  try {
    const articleConfig = config.find(
      (object: ArticleConfig) => object.article === article,
    );
    if (!articleConfig) {
      throw new Error('Article not found.');
    }
    const quantityOnPallet = await countQuantityOnPallet(workplace, article);
    const qr = generatePalletQr(
      article,
      quantityOnPallet,
      articleConfig.palletProc ? articleConfig.palletProc : '000',
    );
    return qr;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while generating pallet qr.');
  }
}

export async function savePalletBatch(
  palletQr: string,
  workplace: string,
  article: string,
  operator: string,
) {
  try {
    const articleConfig = config.find(
      (object: ArticleConfig) =>
        object.workplace === workplace && object.article === article,
    );
    if (!articleConfig) {
      throw new Error('Article config problem!');
    }
    if (palletQr.length < 34 || !palletQr.includes('|')) {
      return { status: 'invalid' };
    }
    const splitPalletQr = palletQr.split('|');
    const qrarticle =
      splitPalletQr[0].length === 7 && splitPalletQr[0].substr(2);
    if (qrarticle !== article) {
      return { status: 'wrong article' };
    }
    const qrQuantity = splitPalletQr[2] && parseInt(splitPalletQr[2].substr(2));
    const quantityOnPallet = await countQuantityOnPallet(workplace, article);
    if (qrQuantity !== quantityOnPallet) {
      return { status: 'wrong quantity' };
    }
    const qrProcess = splitPalletQr[1] && splitPalletQr[1].substr(2);
    if (qrProcess !== articleConfig.palletProc) {
      return { status: 'wrong process' };
    }
    const qrBatch =
      splitPalletQr[3] && splitPalletQr[3].substr(2).toUpperCase();
    if (!qrBatch || qrBatch.length !== 10) {
      return { status: 'invalid' };
    }
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    const existingData = await collection.findOne({ pallet_batch: qrBatch });
    if (existingData) {
      return { status: 'exists' };
    }
    const updateResult = await collection.updateMany(
      {
        status: 'pallet',
        workplace: workplace,
        article: article,
      },
      {
        $set: {
          status: 'warehouse',
          pallet_batch: qrBatch,
          pallet_time: new Date(),
          pallet_operator: operator,
        },
      },
    );
    if (updateResult) {
      return { status: 'saved' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the pallet batch.');
  }
}
