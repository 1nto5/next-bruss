'use server';
import clientPromise from '@/lib/mongo';
import generatePalletQr from '@/app/pro/lib/utils/generatePalletQr';
import config from '@/app/pro/config';
import { countOnPallet } from '../actions';

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

// Save Hydra Batch function
export async function saveHydraBatch136153(hydraQr: string, operator: string) {
  try {
    // // Validate hydra QR code
    if (hydraQr.length < 34 || !hydraQr.includes('|')) {
      return { status: 'invalid' };
    }

    // // Split QR code
    const splitHydraQr = hydraQr.split('|');
    const qrarticle = splitHydraQr[0].length === 7 && splitHydraQr[0].substr(2);

    // // Check article number
    if (qrarticle !== '28067' && qrarticle !== '28042') {
      return { status: 'wrong article' };
    }

    // Find the article configuration
    const articleConfig = config.find(
      (object: ArticleConfig) => object.article === qrarticle,
    );

    if (!articleConfig) {
      throw new Error('Article not found.');
    }

    // Check quantity
    const qrQuantity = splitHydraQr[2] && parseInt(splitHydraQr[2].substr(2));
    if (qrQuantity !== articleConfig.boxSize) {
      return { status: 'wrong quantity' };
    }

    // Check process
    const qrProcess = splitHydraQr[1] && splitHydraQr[1].substr(2);
    if (qrProcess !== articleConfig.hydraProc) {
      return { status: 'wrong process' };
    }

    // Extract batch from QR code
    const qrBatch = splitHydraQr[3] && splitHydraQr[3].substr(2).toUpperCase();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    // Check for existing data
    const existingData = await collection.findOne({ hydra_batch: qrBatch });
    if (existingData) {
      return { status: 'exists' };
    }

    // Check if pallet is full
    const onPallet = await countOnPallet('eol136153', qrarticle);

    if (!articleConfig.palletSize) {
      throw new Error('Pallet size not found.');
    }

    if (onPallet >= articleConfig.palletSize) {
      return { status: 'full pallet' };
    }

    // Insert data
    const insertResult = await collection.insertOne({
      status: 'pallet',
      workplace: 'eol136153',
      article: qrarticle,
      // quantity: qrQuantity,
      hydra_batch: qrBatch,
      hydra_operator: operator,
      hydra_time: new Date(),
    });

    if (insertResult) {
      return { status: 'saved' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the hydra batch.');
  }
}
