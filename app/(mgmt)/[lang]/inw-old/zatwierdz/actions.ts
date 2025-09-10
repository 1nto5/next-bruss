'use server';

import clientPromise from '@/lib/mongo';
import { formatEmailToInitials } from './lib/utils/nameFormat';

type PersonsType = {
  first: string | null;
  nameFirst: string | null;
  second: string | null;
  nameSecond: string | null;
};

type CardOption = {
  value: string;
  label: string;
};

type PositionOption = {
  value: string;
  label: string;
  card: number;
  position: number;
};

type Position = {
  'position': number;
  'identifier': string;
  'articleNumber': number;
  'articleName': string;
  'quantity': number;
  'unit': string;
  'wip': boolean;
  'approver'?: string;
  'approver-time'?: Date;
  'editor'?: string;
  'editor-time'?: Date;
};

const collectionName = 'inventory_cards';

const warehouseSelectOptions = [
  { value: '000', label: '000 - Produkcja + Magazyn' },
  { value: '035', label: '035 - stal niepowleczona z Chin' },
  { value: '054', label: '054 - magazyn zablokowany JAKOŚĆ' },
  { value: '055', label: '055 - magazyn zablokowany GTM' },
  { value: '111', label: '111 - magazyn LAUNCH' },
  { value: '222', label: '222 - magazyn zablokowany PRODUKCJA' },
  // { value: 999, label: '999 - WIP' },
];

export async function getAllCards(): Promise<CardOption[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('inventory_cards');
    const cards = await collection.find({}).toArray();
    const cardOptions = cards.map((card) => {
      // Check if positions exist and calculate total and approved positions
      const totalPositions = card.positions ? card.positions.length : 0;
      const approvedPositions = card.positions
        ? card.positions.filter((p: Position) => p.approver).length
        : 0;

      // Check for warehouse option
      const warehouseOption = warehouseSelectOptions.find(
        (option) => option.value === card.warehouse,
      );

      // Ensure creators array has at least two elements
      const creator1 =
        card.creators && card.creators.length > 0
          ? card.creators[0]
          : 'unknown';
      const creator2 =
        card.creators && card.creators.length > 1
          ? card.creators[1]
          : 'unknown';

      return {
        value: card.number,
        label: warehouseOption
          ? `K: ${card.number} | osoby: ${creator1} + ${creator2} | obszar: ${warehouseOption.label} | sektor: ${card.sector} | zatwierdzone: ${approvedPositions}/${totalPositions}`
          : 'wrong warehouse',
      };
    });

    return cardOptions;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while retrieving the list of cards');
  }
}

export async function getAllPositions(): Promise<PositionOption[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    const cards = await collection.find({}).toArray();

    const formattedPositions: PositionOption[] = [];

    cards.forEach((card) => {
      if (Array.isArray(card.positions)) {
        card.positions.forEach((pos) => {
          formattedPositions.push({
            value: pos.identifier,
            label: `${pos.approver ? 'zatwierdzona | ' : ''} K: ${
              card.number
            } | P: ${pos.position} | art: ${pos.articleNumber} - ${
              pos.articleName
            } | ilość: ${pos.quantity} ${pos.unit} | id: ${
              pos.identifier
            } | osoby: ${card.creators[0]} + ${card.creators[1]} | obszar: ${
              card.warehouse
            } | sektor: ${card.sector}`,
            card: card.number,
            position: pos.position,
          });
        });
      }
    });

    return formattedPositions;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while retrieving the positions.');
  }
}

// Finds the lowest free card number
export async function findLowestFreeCardNumber() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    const cardNumbers = await collection
      .find({}, { projection: { _id: 0, number: 1 } })
      .toArray();
    const sortedNumbers = cardNumbers
      .map((card) => card.number)
      .sort((a, b) => a - b);
    let lowestFreeNumber;
    if (sortedNumbers[0] !== 1) {
      return 1;
    }
    for (let i = 0; i < sortedNumbers.length - 1; i++) {
      if (sortedNumbers[i + 1] - sortedNumbers[i] > 1) {
        lowestFreeNumber = sortedNumbers[i] + 1;
        break;
      }
    }
    if (!lowestFreeNumber) {
      lowestFreeNumber = sortedNumbers[sortedNumbers.length - 1] + 1;
    }
    return lowestFreeNumber;
  } catch (error) {
    console.error(error);
    throw new Error(
      'An error occurred while retrieving the list of card numbers.',
    );
  }
}

export async function reserveCard(
  cardNumber: number,
  persons: PersonsType,
  warehouse: string,
  sector: string,
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    const existingCard = await collection.findOne({ number: cardNumber });

    const hasAccess =
      existingCard?.creators.includes(persons.first) &&
      existingCard?.creators.includes(persons.second);

    if (existingCard && !hasAccess) {
      return 'no access';
    }

    if (existingCard) {
      return 'exists';
    }

    const result = await collection.insertOne({
      number: cardNumber,
      creators: [persons.first, persons.second],
      warehouse: warehouse,
      sector: sector,
    });

    if (result.insertedId) {
      return 'reserved';
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while attempting to reserve the card.');
  }
}

type PositionObject = {
  position: number;
  identifier: string;
  time: string;
  articleNumber: number;
  articleName: string;
  quantity: number;
  unit: string;
  wip: boolean;
  creators?: string[];
  approved?: string;
};

// Gets existing positions for a given card
export async function getExistingPositions(card: number) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    const existingCard = await collection.findOne({ number: card });
    if (!existingCard || !Array.isArray(existingCard.positions)) {
      return [];
    }

    const existingPositionsSelectOptions = existingCard.positions.map(
      (pos) => ({
        value: pos.position,
        label: `${pos.approver ? 'zatwierdzona | ' : ''}K: ${
          existingCard.number
        } | P: ${pos.position} | art: ${pos.articleNumber} - ${
          pos.articleName
        } | ilość: ${pos.quantity} ${pos.unit} | id: ${
          pos.identifier
        } | osoby: ${existingCard.creators.join(' + ')} | obszar: ${
          existingCard.warehouse
        } | sektor: ${existingCard.sector}`,
      }),
    );

    return existingPositionsSelectOptions;
  } catch (error) {
    console.error(error);
    throw new Error(
      'An error occurred while retrieving the list of existing positions.',
    );
  }
}

// Checks if a card is full
export async function checkIsFull(cardNumber: number) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection(collectionName);
  const card = await collection.findOne({ number: cardNumber });
  if (card?.position && card?.positions.length === 25) {
    return true;
  }
  return false;
}

// Gets a list of articles
export async function getArticlesOptions() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('inventory_articles');
    const articles = await collection.find({}).toArray();
    const formattedArticles = articles.map((article) => ({
      value: article.number as string,
      label: `${article.number} - ${article.name}` as string,
      number: article.number as number,
      name: article.name as string,
      unit: article.unit as string,
      converter: article.converter as number,
      max: article.max as number,
    }));
    return formattedArticles;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while retrieving the list of articles.');
  }
}

// Gets a position for a given card and position number
export async function getPosition(card: number, position: number) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    const existingCard = await collection.findOne({ number: card });

    if (!existingCard) {
      return { status: 'no card' };
    }

    if (position < 1 || position > 25) {
      return { status: 'wrong position' };
    }
    if (!existingCard.positions) {
      return { status: 'new' };
    }
    const positionOnCard = existingCard.positions.find(
      (pos: { position: number }) => pos.position === position,
    );

    if (!positionOnCard) {
      if (positionOnCard > existingCard.positions.length + 1) {
        return {
          status: 'skipped',
          position: existingCard.positions.length + 1,
        };
      }
      return { status: 'new' };
    }
    return {
      status: 'found',
      positionOnCard,
    };
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while retrieving the position.');
  }
}

export async function savePosition(
  card: number,
  position: number,
  articleNumber: number,
  articleName: string,
  quantity: number,
  unit: string,
  wip: boolean,
  editor: string,
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    const updateFields = {
      'positions.$.articleNumber': articleNumber,
      'positions.$.articleName': articleName,
      'positions.$.quantity': quantity,
      'positions.$.unit': unit,
      'positions.$.wip': wip,
      'positions.$.editor': editor,
      'positions.$.editor-time': new Date(),
    };

    const updateResult = await collection.updateOne(
      { 'number': card, 'positions.position': position },
      { $set: updateFields },
    );

    if (updateResult.matchedCount === 0) {
      const identifier = `${card}${formatEmailToInitials(editor)}${position}`;
      const insertResult = await collection.updateOne(
        { number: card },
        {
          $push: {
            positions: {
              position,
              identifier,
              articleNumber,
              articleName,
              quantity,
              unit,
              wip,
              editor,
              'editor-time': new Date(),
            },
          },
        },
      );
      if (insertResult.modifiedCount > 0) {
        return {
          status: 'added',
          identifier,
        };
      } else {
        return { status: 'not added' };
      }
    } else {
      if (updateResult.modifiedCount > 0) {
        return { status: 'updated' };
      } else {
        return { status: 'not updated' };
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the position.');
  }
}

export async function approvePosition(
  card: number,
  position: number,
  approver: string,
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    const updateResult = await collection.updateOne(
      { 'number': card, 'positions.position': position },
      {
        $set: {
          'positions.$.approver': approver,
          'positions.$.approver-time': new Date(),
        },
      },
    );
    if (updateResult.modifiedCount > 0) {
      return { status: 'approved' };
    } else {
      return { status: 'not approved' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while approving the position.');
  }
}
