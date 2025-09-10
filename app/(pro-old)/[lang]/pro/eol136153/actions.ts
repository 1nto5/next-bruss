'use server';

import config from '@/app/(pro-old)/[lang]/pro/config';
import clientPromise from '@/lib/mongo';
import { countBoxesOnPallet } from '../actions';

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

export async function saveHydraBatch136153(hydraQr: string, operator: string) {
  try {
    if (hydraQr.length < 34 || !hydraQr.includes('|')) {
      return { status: 'invalid' };
    }
    const splitHydraQr = hydraQr.split('|');
    const qrarticle = splitHydraQr[0].length === 7 && splitHydraQr[0].substr(2);
    if (qrarticle !== '28067' && qrarticle !== '28042') {
      return { status: 'wrong article' };
    }
    const articleConfig = config.find(
      (object: ArticleConfig) => object.article === qrarticle,
    );
    if (!articleConfig) {
      throw new Error('Article not found.');
    }
    const qrQuantity = splitHydraQr[2] && parseInt(splitHydraQr[2].substr(2));
    if (qrQuantity !== articleConfig.boxSize) {
      return { status: 'wrong quantity' };
    }
    const qrProcess = splitHydraQr[1] && splitHydraQr[1].substr(2);
    if (qrProcess !== articleConfig.hydraProc) {
      return { status: 'wrong process' };
    }
    const qrBatch = splitHydraQr[3] && splitHydraQr[3].substr(2).toUpperCase();
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    const existingData = await collection.findOne({ hydra_batch: qrBatch });
    if (existingData) {
      return { status: 'exists' };
    }
    const boxesOnPallet = await countBoxesOnPallet('eol136153', qrarticle);
    if (!articleConfig.palletSize) {
      throw new Error('Pallet size not found.');
    }
    if (boxesOnPallet >= articleConfig.palletSize) {
      return { status: 'full pallet' };
    }
    const insertResult = await collection.insertOne({
      status: 'pallet',
      workplace: 'eol136153',
      type: articleConfig.type,
      article: qrarticle,
      time: new Date(),
      hydra_batch: qrBatch,
      hydra_operator: operator,
    });
    if (insertResult) {
      return { status: 'saved' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the hydra batch.');
  }
}
