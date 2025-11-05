'use server';

import { dbc } from '@/lib/db/mongo';
import { v4 as uuidv4 } from 'uuid';
import type {
  ArticleStatus,
  HydraScanResult,
  PalletScanResult,
} from './lib/types';

// Article configurations for EOL136153
const articleConfigs = {
  '28067': {
    article: '28067',
    name: 'M-136-K-1-A',
    type: 'eol136153',
    palletSize: 25,
    boxSize: 12,
    hydraProc: '090',
    palletProc: '876',
  },
  '28042': {
    article: '28042',
    name: 'M-153-K-C',
    type: 'eol136153',
    palletSize: 30,
    boxSize: 10,
    hydraProc: '090',
    palletProc: '876',
  },
};

export async function login(data: {
  identifier1: string;
  identifier2?: string;
  identifier3?: string;
}) {
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

export async function getArticleStatuses(): Promise<ArticleStatus[]> {
  try {
    const collection = await dbc('eol136153_scans');

    const statuses: ArticleStatus[] = [];

    for (const [articleNumber, config] of Object.entries(articleConfigs)) {
      const boxesOnPallet = await collection.countDocuments({
        status: 'pallet',
        workplace: 'eol136153',
        article: articleNumber,
      });

      statuses.push({
        article: articleNumber,
        name: config.name,
        boxesOnPallet,
        palletSize: config.palletSize,
        isFull: boxesOnPallet >= config.palletSize,
      });
    }

    return statuses;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function saveHydraBatch(
  hydraQr: string,
  operators: string[],
): Promise<HydraScanResult> {
  try {
    // Validate QR format
    if (hydraQr.length < 34 || !hydraQr.includes('|')) {
      return { status: 'invalid' };
    }

    const splitHydraQr = hydraQr.split('|');
    const qrArticle =
      splitHydraQr[0]?.length === 7 ? splitHydraQr[0].substring(2) : null;

    // Check if article is valid for this workplace
    if (qrArticle !== '28067' && qrArticle !== '28042') {
      return { status: 'wrong article' };
    }

    const articleConfig = articleConfigs[qrArticle as '28067' | '28042'];
    if (!articleConfig) {
      return { status: 'error' };
    }

    // Validate quantity
    const qrQuantity = splitHydraQr[2]
      ? parseInt(splitHydraQr[2].substring(2))
      : 0;
    if (qrQuantity !== articleConfig.boxSize) {
      return { status: 'wrong quantity' };
    }

    // Validate process
    const qrProcess = splitHydraQr[1]?.substring(2);
    if (qrProcess !== articleConfig.hydraProc) {
      return { status: 'wrong process' };
    }

    // Extract batch
    const qrBatch = splitHydraQr[3]?.substring(2).toUpperCase();
    if (!qrBatch) {
      return { status: 'invalid' };
    }

    const collection = await dbc('eol136153_scans');

    // Check if batch already exists
    const existingData = await collection.findOne({ hydra_batch: qrBatch });
    if (existingData) {
      return { status: 'exists' };
    }

    // Check if pallet is full
    const boxesOnPallet = await collection.countDocuments({
      status: 'pallet',
      workplace: 'eol136153',
      article: qrArticle,
    });

    if (boxesOnPallet >= articleConfig.palletSize) {
      return { status: 'full pallet' };
    }

    // Insert the scan
    await collection.insertOne({
      status: 'pallet',
      workplace: 'eol136153',
      type: articleConfig.type,
      article: qrArticle,
      time: new Date(),
      hydra_batch: qrBatch,
      hydra_operator: operators,
    });

    return {
      status: 'saved',
      article: qrArticle,
      batch: qrBatch,
    };
  } catch (error) {
    console.error(error);
    return { status: 'error' };
  }
}

export async function generatePalletBatch(article: string): Promise<string> {
  try {
    const articleConfig = articleConfigs[article as '28067' | '28042'];
    if (!articleConfig) {
      throw new Error('Invalid article');
    }

    const collection = await dbc('eol136153_scans');
    const quantityOnPallet = await collection.countDocuments({
      status: 'pallet',
      workplace: 'eol136153',
      article,
    });

    const totalQuantity = quantityOnPallet * articleConfig.boxSize;

    // Generate pallet QR code
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const batchId = uuidv4().slice(0, 10).toUpperCase();

    const palletQr = [
      `A:${article}`,
      `O:${articleConfig.palletProc}`,
      `Q:${totalQuantity}`,
      `B:${batchId}`,
      `C:G`,
    ].join('|');

    return palletQr;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to generate pallet batch');
  }
}

export async function savePalletBatch(
  palletQr: string,
  article: string,
  operators: string[],
): Promise<PalletScanResult> {
  try {
    // Validate QR format
    if (palletQr.length < 34 || !palletQr.includes('|')) {
      return { status: 'invalid' };
    }

    const splitPalletQr = palletQr.split('|');
    const qrArticle =
      splitPalletQr[0]?.length === 7 ? splitPalletQr[0].substring(2) : null;

    if (qrArticle !== article) {
      return { status: 'invalid' };
    }

    const qrBatch = splitPalletQr[3]?.substring(2).toUpperCase();
    if (!qrBatch || qrBatch.length !== 10) {
      return { status: 'invalid' };
    }

    const collection = await dbc('eol136153_scans');

    // Check if pallet batch already exists
    const existingData = await collection.findOne({ pallet_batch: qrBatch });
    if (existingData) {
      return { status: 'error' };
    }

    // Update all pallet items to warehouse status
    const updateResult = await collection.updateMany(
      {
        status: 'pallet',
        workplace: 'eol136153',
        article,
      },
      {
        $set: {
          status: 'warehouse',
          pallet_batch: qrBatch,
          pallet_time: new Date(),
          pallet_operator: operators,
        },
      },
    );

    if (updateResult.modifiedCount > 0) {
      return {
        status: 'success',
        palletBatch: qrBatch,
      };
    }

    return { status: 'error' };
  } catch (error) {
    console.error(error);
    return { status: 'error' };
  }
}

export async function getPalletQr(article: string): Promise<string | null> {
  try {
    const articleConfig = articleConfigs[article as '28067' | '28042'];
    if (!articleConfig) {
      return null;
    }

    const collection = await dbc('eol136153_scans');

    // Count boxes on pallet
    const boxesOnPallet = await collection.countDocuments({
      status: 'pallet',
      workplace: 'eol136153',
      article,
    });

    const totalQuantity = boxesOnPallet * articleConfig.boxSize;

    // Generate unique batch number by checking against existing batches
    let batch = '';
    let isUnique = false;

    while (!isUnique) {
      batch = `EE${uuidv4().slice(0, 8).toUpperCase()}`;

      // Check if batch exists in eol136153_scans collection
      const existingBatch = await collection.findOne({
        pallet_batch: batch,
      });

      // If batch doesn't exist, it's unique
      if (!existingBatch) {
        isUnique = true;
      }
    }

    // Generate QR code string in the format expected by the system
    return `A:${article}|O:${articleConfig.palletProc}|Q:${totalQuantity}|B:${batch}|C:G`;
  } catch (error) {
    console.error('Error generating pallet QR:', error);
    return null;
  }
}

export async function printPalletLabel(
  workplace: string,
  articleNumber: string,
  articleName: string,
): Promise<{ success: boolean }> {
  try {
    // This would integrate with your actual printing system
    // For now, just log the print request
    console.log(
      `Printing label for ${articleName} (${articleNumber}) at ${workplace}`,
    );

    // In production, you would call your printing API here
    // await printingAPI.printLabel({ workplace, articleNumber, articleName });

    return { success: true };
  } catch (error) {
    console.error('Print error:', error);
    return { success: false };
  }
}

// Get list of hydra batches (boxes) on pallet for a specific article
export async function getPalletBoxes(
  article: string,
): Promise<{ hydra: string; time: string }[]> {
  try {
    const collection = await dbc('eol136153_scans');

    const boxes = await collection
      .find({
        status: 'pallet',
        workplace: 'eol136153',
        article,
      })
      .sort({ time: -1 })
      .toArray();

    return boxes.map((box) => ({
      hydra: box.hydra_batch as string,
      time: (box.time as Date).toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching pallet boxes:', error);
    return [];
  }
}

// Delete hydra batch from pallet (set status to rework)
export async function deleteHydraBatch(
  hydraBatch: string,
  operators: string[],
): Promise<{ message: string }> {
  try {
    if (!hydraBatch || !operators || operators.length === 0) {
      console.error('Invalid parameters for deleteHydraBatch:', {
        hydraBatch,
        operators,
      });
      return { message: 'invalid parameters' };
    }

    const collection = await dbc('eol136153_scans');

    // Check if the hydra batch exists in pallet status
    const batchRecord = await collection.findOne({
      hydra_batch: hydraBatch,
      status: 'pallet',
    });

    if (!batchRecord) {
      console.warn(`Hydra batch ${hydraBatch} not found in pallet status`);
      return { message: 'not found' };
    }

    // Update the single record to rework status
    const result = await collection.updateOne(
      { _id: batchRecord._id },
      {
        $set: {
          status: 'rework',
          rework_time: new Date(),
          rework_reason: 'removed from pallet by operator',
          rework_user: `personal number: ${operators.join(', ')}`,
        },
      },
    );

    if (result.modifiedCount === 1) {
      return { message: 'deleted' };
    }

    console.error(
      `Failed to delete hydra batch ${hydraBatch} - no documents modified`,
    );
    return { message: 'update failed' };
  } catch (error) {
    console.error('Error in deleteHydraBatch:', error);
    return { message: 'error' };
  }
}
