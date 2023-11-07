'use server';

import { connectToMongo } from '@/lib/mongo/connector';
import moment from 'moment';
import crypto from 'crypto';

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

const warehouseSelectOptions = [
  { value: '000', label: '000 - Rohstolfe und Fertigteile' },
  { value: '035', label: '035 - Metalteile Taicang' },
  { value: '054', label: '054 - Magazyn wstrzymanych' },
  { value: '055', label: '055 - Cz.zablokowane GTM' },
  { value: '111', label: '111 - Magazyn Launch' },
  { value: '222', label: '222 - Magazyn zablokowany produkcja' },
  // { value: 999, label: '999 - WIP' },
];

export async function GetAllCards(): Promise<CardOption[]> {
  try {
    const collection = await connectToMongo('inventory_cards');
    const cards = await collection.find({}).toArray();
    const cardOptions = cards.map((card) => {
      const warehouseOption = warehouseSelectOptions.find(
        (option) => option.value === card.warehouse,
      );
      return {
        value: card.number,
        label: warehouseOption
          ? `${card.number} - ${warehouseOption.label}`
          : 'wrong warehouse',
      };
    });

    return cardOptions;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while retrieving the list of cards');
  }
}

export async function GetAllPositions() {
  try {
    const collection = await connectToMongo('inventory_cards');
    const cards = await collection.find({}).toArray();
    const positions = cards.flatMap((card) =>
      Array.isArray(card.positions) ? card.positions : [],
    );

    const formattedPositions = positions.map((position) => ({
      value: position.identifier,
      label: `${position.identifier} - ${position.articleNumber} - ${position.articleName} - ${position.quantity} ${position.unit}`,
    }));

    return formattedPositions;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while retrieving the positions.');
  }
}

// Finds the lowest free card number
export async function FindLowestFreeCardNumber() {
  try {
    const collection = await connectToMongo('inventory_cards');
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

export async function ReserveCard(
  cardNumber: number,
  persons: PersonsType,
  warehouse: string,
) {
  try {
    const collection = await connectToMongo('inventory_cards');
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
  creators: string[];
  approved?: string;
};

// Gets existing positions for a given card
export async function GetExistingPositions(card: number) {
  try {
    const collection = await connectToMongo('inventory_cards');
    const existingCard = await collection.findOne({ number: card });
    if (!existingCard || !Array.isArray(existingCard.positions)) {
      return [];
    }
    const existingPositionsSelectOptions = existingCard.positions.map(
      (pos: PositionObject) => ({
        value: pos.position,
        label: `P: ${pos.position} A:${pos.articleNumber} - ${pos.articleName} Q: ${pos.quantity} ${pos.unit} I: ${pos.identifier} U: ${pos.creators}`,
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
export async function CheckIsFull(cardNumber: number) {
  const collection = await connectToMongo('inventory_cards');
  const card = await collection.findOne({ number: cardNumber });
  if (card?.position && card?.positions.length === 25) {
    return true;
  }
  return false;
}

// Gets a list of articles
export async function GetArticlesOptions() {
  try {
    const collection = await connectToMongo('inventory_articles');
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
export async function GetPosition(
  card: number,
  position: number,
  persons: PersonsType,
) {
  try {
    const collection = await connectToMongo('inventory_cards');
    const existingCard = await collection.findOne({ number: card });

    if (!existingCard) {
      return { status: 'no card' };
    }
    if (
      !existingCard.creators.includes(persons.first) ||
      !existingCard.creators.includes(persons.second)
    ) {
      return { status: 'no access' };
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

// Saves a position to the database
export async function SavePosition(
  card: number,
  position: number,
  articleNumber: number,
  articleName: string,
  quantity: number,
  unit: string,
  wip: boolean,
) {
  try {
    const collection = await connectToMongo('inventory_cards');

    const currentDate = new Date().toISOString();
    const positionData = {
      position: position,
      time: currentDate,
      articleNumber: articleNumber,
      articleName: articleName,
      quantity: quantity,
      unit: unit,
      wip: wip,
    };
    const updateResult = await collection.updateOne(
      {
        'number': card,
        'positions.position': position,
      },
      {
        $set: { 'positions.$': positionData },
      },
    );
    if (updateResult.matchedCount === 0) {
      const insertResult = await collection.updateOne(
        { number: card },
        {
          $push: { positions: positionData },
        },
      );
      if (insertResult.modifiedCount > 0) {
        return { status: 'added' };
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
