'use server';

import { connectToMongo } from '@/lib/mongo/connector';
import crypto from 'crypto';
import moment from 'moment';

// Options for the warehouse select input
const warehouseSelectOptions = [
  { value: '000', label: '000 - Rohstolfe und Fertigteile' },
  { value: '035', label: '035 - Metalteile Taicang' },
  { value: '054', label: '054 - Magazyn wstrzymanych' },
  { value: '055', label: '055 - Cz.zablokowane GTM' },
  { value: '111', label: '111 - Magazyn Launch' },
  { value: '222', label: '222 - Magazyn zablokowany produkcja' },
  // { value: 999, label: '999 - WIP' },
];

// Fetches existing cards for a given user
type CardOption = {
  value: string;
  label: string;
};

export async function GetExistingCards(email: string): Promise<CardOption[]> {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email address');
  }

  try {
    const collection = await connectToMongo('inventory_cards');
    const cards = await collection.find({ creator: email }).toArray();
    const cardOptions = cards.map((card) => {
      const warehouseOption = warehouseSelectOptions.find(
        (option) => option.value === card.warehause,
      );
      return {
        value: card.number,
        label: warehouseOption
          ? `${card.number} -  ${warehouseOption.label}`
          : 'wrong warehouse',
      };
    });
    return cardOptions;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while retrieving the list of cards');
  }
}

function isValidEmail(email: string): boolean {
  // Use a regular expression to validate the email address
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

// Reserves a card for a given user
export async function ReserveCard(
  cardNumber: number,
  email: string,
  warehause: string,
) {
  try {
    const collection = await connectToMongo('inventory_cards');
    const existingCard = await collection.findOne({ number: cardNumber });

    if (existingCard && existingCard.creator !== email) {
      return 'no access';
    }

    if (existingCard) {
      return 'exists';
    }

    const result = await collection.insertOne({
      number: cardNumber,
      creator: email,
      warehause: warehause,
    });

    if (result.insertedId) {
      return 'reserved';
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while retrieving the list of articles.');
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
  user: string;
  approved?: string;
};

// Gets existing positions for a given card
export async function GetExistingPositions(cardNumber: number, email: string) {
  try {
    const collection = await connectToMongo('inventory_cards');
    const card = await collection.findOne({ number: cardNumber });
    if (
      card?.creator !== email &&
      !(await GetUserRoles(email)).includes('inventory_aprover')
    ) {
      return 'no access';
    }
    if (!card || !Array.isArray(card.positions)) {
      return [];
    }
    const existingPositionsSelectOptions = card.positions.map(
      (pos: PositionObject) => ({
        value: pos.position,
        label: `${pos.position} - ${pos.articleNumber} - ${pos.articleName} - ${pos.quantity} ${pos.unit} - ${pos.identifier}`,
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

// Finds the lowest free position for a given card
export async function FindLowestFreePosition(cardNumber: number) {
  try {
    const collection = await connectToMongo('inventory_cards');
    const card = await collection.findOne({ number: cardNumber });
    if (!card) {
      throw new Error(`Card ${cardNumber} not found.`);
    }
    const positions = card.positions || [];
    if (positions.length === 25) {
      return 'full';
    }
    const usedPositions = positions.map((pos: PositionObject) => pos.position);
    for (let i = 1; i <= 25; i++) {
      if (!usedPositions.includes(i)) {
        return i;
      }
    }
    throw new Error('Unexpected error when searching for a free position.');
  } catch (error) {
    console.error(error);
    throw new Error(
      'An error occurred while searching for the lowest available position on the card.',
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
export async function GetArticles() {
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

async function GetUserRoles(email: string) {
  try {
    const collection = await connectToMongo('users');
    const user = await collection.findOne({ email: email });
    if (!user) {
      return [];
    } else {
      return user.roles;
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while retrieving the user roles.');
  }
}

// Gets a position for a given card and position number
export async function GetPosition(
  cardNumber: number,
  positionNumber: number,
  user: string,
) {
  try {
    const collection = await connectToMongo('inventory_cards');
    const card = await collection.findOne({ number: cardNumber });

    if (!card) {
      return { status: 'no card' };
    }
    if (
      card.creator !== user &&
      !(await GetUserRoles(user)).includes('inventory_aprover')
    ) {
      return { status: 'no access' };
    }
    if (positionNumber < 1 || positionNumber > 25) {
      return { status: 'wrong position' };
    }
    if (!card.positions) {
      return { status: 'new' };
    }
    const position = card.positions.find(
      (pos: { position: number }) => pos.position === positionNumber,
    );

    if (!position) {
      if (positionNumber > card.positions.length + 1) {
        return {
          status: 'skipped',
          position: card.positions.length + 1,
        };
      }
      return { status: 'new' };
    }
    return {
      status: 'found',
      position,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Wystąpił błąd podczas pobierania pozycji.');
  }
}

// Generates a unique identifier for a position
function generateUniqueIdentifier(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const week = moment().week().toString().padStart(2, '0');
  let randomLetters = '';
  while (randomLetters.length < 4) {
    const randomBytes = crypto.randomBytes(3).toString('base64');
    const extractedLetters = randomBytes.replace(/[^a-zA-Z]/g, '');
    randomLetters += extractedLetters;
  }
  randomLetters = randomLetters.substring(0, 4).toUpperCase();
  return `${year}${randomLetters}${week}`;
}

// Saves a position to the database
export async function SavePosition(
  cardNumber: number,
  position: number,
  articleNumber: number,
  articleName: string,
  quantity: number,
  unit: string,
  wip: boolean,
  user: string,
) {
  try {
    const collection = await connectToMongo('inventory_cards');
    let isUnique = false;
    let identifier;
    while (!isUnique) {
      identifier = generateUniqueIdentifier();
      const allIdentifiers = await collection
        .find({}, { projection: { 'positions.identifier': 1 } })
        .toArray();

      const existingIdentifiers = allIdentifiers.flatMap((card) =>
        Array.isArray(card.positions)
          ? card.positions.map((pos) => pos.identifier)
          : [],
      );

      if (!existingIdentifiers.includes(identifier)) {
        isUnique = true;
      }
    }
    const currentDate = new Date().toISOString();
    const positionData = {
      position: position,
      identifier: identifier,
      time: currentDate,
      articleNumber: articleNumber,
      articleName: articleName,
      quantity: quantity,
      unit: unit,
      wip: wip,
      user: user,
    };
    const updateResult = await collection.updateOne(
      {
        'number': cardNumber,
        'positions.position': position,
      },
      {
        $set: { 'positions.$': positionData },
      },
    );
    if (updateResult.matchedCount === 0) {
      const insertResult = await collection.updateOne(
        { number: cardNumber },
        {
          $push: { positions: positionData },
        },
      );
      if (insertResult.modifiedCount > 0) {
        return { status: 'added', identifier };
      } else {
        return { status: 'not added' };
      }
    } else {
      if (updateResult.modifiedCount > 0) {
        return { status: 'updated', identifier };
      } else {
        return { status: 'not updated' };
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the position.');
  }
}

// Approves a position for a given card and position number
export async function ApprovePosition(
  cardNumber: number,
  position: number,
  user: string,
) {
  try {
    const collection = await connectToMongo('inventory_cards');
    const updateResult = await collection.updateOne(
      {
        'number': cardNumber,
        'positions.position': position,
      },
      {
        $set: { 'positions.$.approved': user },
      },
    );
    if (updateResult.modifiedCount > 0) {
      return { status: 'approved' };
    } else {
      return { status: 'no changes' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while confirming the email.');
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

export async function GetIdentifierCardNumberAndPositionNumber(
  identifier: string,
) {
  try {
    const collection = await connectToMongo('inventory_cards');
    const cards = await collection.find({}).toArray();

    for (const card of cards) {
      const position = card.positions?.find(
        (pos: { identifier: string }) => pos.identifier === identifier,
      );

      if (position) {
        return {
          cardNumber: card.number,
          positionNumber: position.position,
        };
      }
    }

    return 'not found';
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while retrieving the positions.');
  }
}
