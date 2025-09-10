'use server';

import { PositionZodType } from '@/app/(mgmt)/[lang]/inw-2/zatwierdz/lib/zod';
import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { revalidateTag } from 'next/cache';
import { generateExcelBuffer } from './lib/excel-export';
// import { redirect } from 'next/navigation';

export async function revalidateCards() {
  revalidateTag('inventory-cards');
}

export async function revalidateCardPositions() {
  revalidateTag('inventory-card-positions');
}

export async function revalidatePositions() {
  revalidateTag('inventory-positions');
}

export async function revalidateAll() {
  revalidateTag('inventory-cards');
  revalidateTag('inventory-card-positions');
  revalidateTag('inventory-positions');
}

export async function updatePosition(
  identifier: string,
  data: PositionZodType,
) {
  try {
    const session = await auth();
    if (
      !session ||
      !(session.user?.roles ?? []).includes('inventory-approve')
    ) {
      return { error: 'unauthorized' };
    }
    const collection = await dbc('inventory_cards');
    const [card, position] = identifier.split('/');
    const articlesCollection = await dbc('inventory_articles');
    const article = await articlesCollection.findOne({
      number: data.articleNumber,
    });
    if (!article) {
      return { error: 'article not found' };
    }

    console.log(session.user?.email);

    const positionData: any = {
      time: new Date(),
      articleNumber: article.number,
      articleName: article.name,
      quantity: data.quantity,
      wip: data.wip,
      bin: data.bin,
      deliveryDate: data.deliveryDate,
      comment: data.comment?.toLowerCase(),
      approver: data.approved ? session.user?.email : '',
    };

    if (data.wip) {
      const cardData = await collection.findOne({ number: Number(card) });
      if (cardData && cardData.sector === 'S900') {
        return { error: 'wip not allowed' };
      }
    }

    const res = await collection.updateOne(
      {
        'number': Number(card),
        'positions.position': Number(position),
      },
      {
        $set: {
          'positions.$.time': positionData.time,
          'positions.$.articleNumber': positionData.articleNumber,
          'positions.$.articleName': positionData.articleName,
          'positions.$.quantity': positionData.quantity,
          'positions.$.wip': positionData.wip,
          'positions.$.comment': positionData.comment,
          'positions.$.approver': positionData.approver,
        },
      },
    );

    if (res.matchedCount > 0) {
      revalidateTag('inventory-card-positions');
      revalidateTag('inventory-cards');
      revalidateTag('inventory-positions');
      return { success: 'updated' };
    } else {
      return { error: 'not updated' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'updatePosition server action error' };
  }
}

export async function exportInventoryPositionsToExcel() {
  try {
    const session = await auth();
    if (
      !session ||
      !(session.user?.roles ?? []).includes('inventory-approve')
    ) {
      return { error: 'unauthorized' };
    }

    const collection = await dbc('inventory_cards');
    const inventoryCards = await collection.find().toArray();

    const exportData = inventoryCards.map((card) => ({
      card: {
        number: card.number,
        warehouse: card.warehouse,
        sector: card.sector,
        creators: card.creators,
      },
      positions: card.positions || [],
    }));

    const buffer = await generateExcelBuffer(exportData);

    return {
      success: true,
      data: buffer.toString('base64'),
      filename: `inventory_positions_${new Date().toISOString().split('T')[0]}.xlsx`,
    };
  } catch (error) {
    console.error('Export error:', error);
    return { error: 'export failed' };
  }
}
