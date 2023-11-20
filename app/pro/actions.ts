'use server';
import clientPromise from '@/lib/mongo';
import config from '@/app/pro/config';
import generatePalletQr from '@/app/pro/lib/utils/generatePalletQr';
import {
  fordValidation,
  bmwValidation,
} from '@/app/pro/lib/utils/dmcDateValidation';

// Define Types
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
  palletProc: string;
};

const collectionName = 'scans';

// TODO: change names to more meaningful (quantity on pallet, boxes on pallet etc.)

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
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    // Query the collection
    const count = await collection.countDocuments({
      status: 'box',
      workplace: workplace,
      article: article,
    });

    // Return the count
    return count;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while counting the documents.');
  }
}

export async function countOnPallet(workplace: string, article: string) {
  try {
    // Find the article configuration
    const articleConfig = config.find(
      (object: ArticleConfig) =>
        object.workplace === workplace && object.article === article,
    );

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    // Query the collection
    const count = await collection.countDocuments({
      status: 'pallet',
      workplace: workplace,
      article: article,
    });

    if (!articleConfig || !articleConfig.boxSize) {
      throw new Error('Article config problem!');
    }

    // Return the count
    return count / articleConfig.boxSize;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while counting the documents.');
  }
}

// Function to get the pallet size for a specific workplace and article
export async function getPalletSize(workplace: string, article: string) {
  try {
    // Find the article configuration
    const articleConfig = config.find(
      (object: ArticleConfig) =>
        object.workplace === workplace && object.article === article,
    );

    // Return the pallet size, or null if the article is not found
    return articleConfig ? articleConfig.palletSize : null;
  } catch (error) {
    console.error('Error while getting the pallet size:', error);
    return null;
  }
}

// Function to get the box size for a specific workplace and article
export async function getBoxSize(workplace: string, article: string) {
  try {
    // Find the article configuration
    const articleConfig = config.find(
      (object: ArticleConfig) =>
        object.workplace === workplace && object.article === article,
    );

    // Return the box size, or null if the article is not found
    return articleConfig ? articleConfig.boxSize : null;
  } catch (error) {
    console.error('Error while getting the box size:', error);
    return null;
  }
}

// Generate pallet QR
export async function getPalletQrValueAndPiecesOnPallet(
  article: string,
  boxesOnPallet: number,
) {
  try {
    // Find the article configuration
    const articleConfig = config.find(
      (object: ArticleConfig) => object.article === article,
    );

    if (!articleConfig) {
      throw new Error('Article not found.');
    }
    const qr = generatePalletQr(
      article,
      boxesOnPallet * articleConfig.boxSize,
      articleConfig.palletProc,
    );
    return { qr: qr, piecesOnPallet: boxesOnPallet * articleConfig.boxSize };
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while generating pallet qr.');
  }
}

// Save DMC function
export async function saveDmc(
  dmc: string,
  workplace: string,
  article: string,
  operator: string,
) {
  try {
    // Find the article configuration
    const articleConfig = config.find(
      (object: ArticleConfig) =>
        object.workplace === workplace && object.article === article,
    );

    if (!articleConfig || !articleConfig.baseDmc || !articleConfig.dmcFirVal) {
      throw new Error('Article config problem!');
    }

    // DMC length
    if (dmc.length !== articleConfig.baseDmc.length) {
      return { status: 'invalid' };
    }

    // DMC content
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

    // FORD date
    if (articleConfig.ford && !fordValidation(dmc)) {
      return { status: 'wrong date' };
    }

    // BMW date
    if (articleConfig.bmw && !bmwValidation(dmc)) {
      return { status: 'wrong date' };
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    // Check for existing data
    const existingData = await collection.findOne({ dmc: dmc });
    if (existingData) {
      return { status: 'exists' };
    }

    // Check if pallet is full
    if (articleConfig.palletSize) {
      const onPallet = await countOnPallet(workplace, article);
      const palletSize = await getPalletSize(workplace, article);
      if (!palletSize) {
        throw new Error('Pallet size not found.');
      }
      if (onPallet >= palletSize) {
        return { status: 'full pallet' };
      }
    }

    // Check if box is full
    const inBox = await countInBox(workplace, article);
    const boxSize = await getBoxSize(workplace, article);
    if (!boxSize) {
      throw new Error('Box size not found.');
    }
    if (inBox >= boxSize) {
      return { status: 'full box' };
    }

    // Insert data
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

// // Save Hydra Batch function
export async function saveHydraBatch(
  hydraQr: string,
  workplace: string,
  article: string,
  operator: string,
) {
  try {
    // Find the article configuration
    const articleConfig = config.find(
      (object: ArticleConfig) =>
        object.workplace === workplace && object.article === article,
    );

    if (!articleConfig) {
      throw new Error('Article config problem!');
    }

    // Validate hydra QR code
    if (hydraQr.length < 34 || !hydraQr.includes('|')) {
      return { status: 'invalid' };
    }

    // Split QR code
    const splitHydraQr = hydraQr.split('|');
    const qrarticle = splitHydraQr[0].length === 7 && splitHydraQr[0].substr(2);

    // Check article number
    if (qrarticle !== article) {
      return { status: 'wrong article' };
    }

    // Check quantity
    const qrQuantity = splitHydraQr[2] && parseInt(splitHydraQr[2].substr(2));
    if (qrQuantity !== articleConfig.boxSize) {
      return { status: 'wrong quantity' };
    }

    // Check process
    const qrProcess = splitHydraQr[1] && splitHydraQr[1].substr(2);
    if (!articleConfig.hydraProc.includes(qrProcess)) {
      return { status: 'wrong process' };
    }

    // Extract batch from QR code
    const qrBatch = splitHydraQr[3] && splitHydraQr[3].substr(2).toUpperCase();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    // Check for existing data
    const existingBatch = await collection.findOne({ hydra_batch: qrBatch });
    if (existingBatch) {
      return { status: 'exists' };
    }

    // Check if pallet is full
    if (articleConfig.palletSize) {
      const onPallet = await countOnPallet(workplace, article);
      const palletSize = await getPalletSize(workplace, article);
      if (!palletSize) {
        throw new Error('Pallet size not found.');
      }
      if (onPallet >= palletSize) {
        return { status: 'full pallet' };
      }
    }

    const existingData = await collection.findOne({
      workplace: workplace,
      article: article,
    });

    if (existingData) {
      const updateResult = await collection.updateMany(
        { workplace: workplace, article: article },
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

// Save Pallet Batch function
export async function savePalletBatch(
  palletQr: string,
  workplace: string,
  article: string,
  quantityOnPallet: number,
  operator: string,
) {
  try {
    // Find the article configuration
    const articleConfig = config.find(
      (object: ArticleConfig) =>
        object.workplace === workplace && object.article === article,
    );

    if (!articleConfig) {
      throw new Error('Article config problem!');
    }

    // // Validate hydra QR code
    if (palletQr.length < 34 || !palletQr.includes('|')) {
      return { status: 'invalid' };
    }

    // // Split QR code
    const splitPalletQr = palletQr.split('|');
    const qrarticle =
      splitPalletQr[0].length === 7 && splitPalletQr[0].substr(2);

    // // Check article number
    if (qrarticle !== article) {
      return { status: 'wrong article' };
    }

    // Check quantity
    const qrQuantity = splitPalletQr[2] && parseInt(splitPalletQr[2].substr(2));
    if (qrQuantity !== quantityOnPallet * articleConfig.boxSize) {
      return { status: 'wrong quantity' };
    }

    // Check process
    const qrProcess = splitPalletQr[1] && splitPalletQr[1].substr(2);
    if (qrProcess !== articleConfig.palletProc) {
      return { status: 'wrong process' };
    }

    // Extract batch from QR code and test length
    const qrBatch =
      splitPalletQr[3] && splitPalletQr[3].substr(2).toUpperCase();
    if (!qrBatch || qrBatch.length !== 10) {
      return { status: 'invalid' };
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    // Check for existing data
    const existingData = await collection.findOne({ pallet_batch: qrBatch });
    if (existingData) {
      return { status: 'exists' };
    }

    // Update documents with matching criteria
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
