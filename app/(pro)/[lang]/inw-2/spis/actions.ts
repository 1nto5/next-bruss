'use server';

// import clientPromise from '@/lib/mongo';
import { dbc } from '@/lib/mongo';

import { loginInventoryType } from '@/lib/z/inventory';
import { getLastNameFirstLetter } from '../../../../../lib/utils/nameFormat';

type PersonsType = {
  first?: string | null;
  nameFirst?: string | null;
  second?: string | null;
  nameSecond?: string | null;
};

type CardOption = {
  value: string;
  label: string;
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

export async function login(data: loginInventoryType) {
  try {
    const collection = await dbc('persons');

    // Znalezienie pierwszej osoby
    const person1 = await collection.findOne({
      personalNumber: data.personalNumber1,
    });
    if (!person1) {
      return { error: 'no person 1' };
    }
    if (data.password1 !== person1.password) {
      return { error: 'wrong password 1' };
    }

    // Znalezienie drugiej osoby
    const person2 = await collection.findOne({
      personalNumber: data.personalNumber2,
    });
    if (!person2) {
      return { error: 'no person 2' };
    }
    if (data.password2 !== person2.password) {
      return { error: 'wrong password 2' };
    }

    const encodedIds = Buffer.from(
      `${person1._id.toString()}:${person2._id.toString()}`,
    ).toString('base64');

    return { success: true, token: encodedIds };
  } catch (error) {
    console.error(error);
    return { error: 'login server action error' };
  }
}

// export async function findDeviation(id: string): Promise<DeviationType | null> {
//   const session = await auth();
//   if (!session || !session.user.email) {
//     redirect('/auth');
//   }
//   try {
//     const collection = await dbc('deviations');
//     const res = await collection.findOne({
//       _id: new ObjectId(id),
//     });
//     console.log('res', res);
//     if (res && res.status === 'draft' && res.owner === session.user.email) {
//       const { _id, ...deviation } = res;
//       return { id: _id.toString(), ...deviation } as DeviationType;
//     }

//     return null;
//   } catch (error) {
//     console.error(error);
//     throw new Error('findDeviation server action error');
//   }
// }

// Gets a list of articles
// export async function getArticlesOptions() {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const collection = db.collection('inventory_articles');
//     const articles = await collection.find({}).toArray();
//     const formattedArticles = articles.map((article) => ({
//       value: article.number as string,
//       label: `${article.number} - ${article.name}` as string,
//       number: article.number as number,
//       name: article.name as string,
//       unit: article.unit as string,
//       converter: article.converter as number,
//       max: article.max as number,
//     }));
//     return formattedArticles;
//   } catch (error) {
//     console.error(error);
//     throw new Error('An error occurred while retrieving the list of articles.');
//   }
// }

// export async function getExistingCards(
//   persons: PersonsType,
// ): Promise<CardOption[]> {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const collection = db.collection(collectionName);
//     const cards = await collection.find({}).toArray();
//     const filteredCards = cards.filter(
//       (card) =>
//         card.creators.includes(persons.first) &&
//         card.creators.includes(persons.second),
//     );
//     const cardOptions = filteredCards.map((card) => {
//       const warehouseOption = warehouseSelectOptions.find(
//         (option) => option.value === card.warehouse,
//       );
//       return {
//         value: card.number,
//         label: warehouseOption
//           ? `${card.number} - ${warehouseOption.label}`
//           : 'wrong warehouse',
//       };
//     });

//     return cardOptions;
//   } catch (error) {
//     console.error(error);
//     throw new Error('An error occurred while retrieving the list of cards');
//   }
// }

// // Finds the lowest free card number
// export async function findLowestFreeCardNumber() {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const collection = db.collection(collectionName);
//     const cardNumbers = await collection
//       .find({}, { projection: { _id: 0, number: 1 } })
//       .toArray();
//     const sortedNumbers = cardNumbers
//       .map((card) => card.number)
//       .sort((a, b) => a - b);
//     let lowestFreeNumber;
//     if (sortedNumbers[0] !== 1) {
//       return 1;
//     }
//     for (let i = 0; i < sortedNumbers.length - 1; i++) {
//       if (sortedNumbers[i + 1] - sortedNumbers[i] > 1) {
//         lowestFreeNumber = sortedNumbers[i] + 1;
//         break;
//       }
//     }
//     if (!lowestFreeNumber) {
//       lowestFreeNumber = sortedNumbers[sortedNumbers.length - 1] + 1;
//     }
//     return lowestFreeNumber;
//   } catch (error) {
//     console.error(error);
//     throw new Error(
//       'An error occurred while retrieving the list of card numbers.',
//     );
//   }
// }

// export async function getCardWarehouseAndSector(cardNumber: number) {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const collection = db.collection(collectionName);
//     const card = await collection.findOne({ number: cardNumber });
//     if (!card) {
//       return null;
//     }
//     return { warehouse: card.warehouse, sector: card.sector };
//   } catch (error) {
//     console.error(error);
//     throw new Error('An error occurred while retrieving the card data.');
//   }
// }

// export async function reserveCard(
//   cardNumber: number,
//   persons: PersonsType,
//   warehouse: string,
//   sector: string,
// ) {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const collection = db.collection(collectionName);
//     const existingCard = await collection.findOne({ number: cardNumber });

//     const hasAccess =
//       existingCard?.creators.includes(persons.first) &&
//       existingCard?.creators.includes(persons.second);

//     if (existingCard && !hasAccess) {
//       return 'no access';
//     }

//     if (existingCard) {
//       return 'exists';
//     }

//     const result = await collection.insertOne({
//       number: cardNumber,
//       creators: [persons.first, persons.second],
//       warehouse: warehouse,
//       sector: sector,
//     });

//     if (result.insertedId) {
//       return 'reserved';
//     }
//   } catch (error) {
//     console.error(error);
//     throw new Error('An error occurred while attempting to reserve the card.');
//   }
// }

// type PositionObject = {
//   position: number;
//   identifier: string;
//   time: string;
//   articleNumber: number;
//   articleName: string;
//   quantity: number;
//   unit: string;
//   wip: boolean;
//   creators: string[];
//   approved?: string;
// };

// // Gets existing positions for a given card
// export async function getExistingPositions(card: number, persons: PersonsType) {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const collection = db.collection(collectionName);
//     const existingCard = await collection.findOne({ number: card });
//     if (
//       !existingCard?.creators.includes(persons.first) ||
//       !existingCard?.creators.includes(persons.second)
//     ) {
//       return 'no access';
//     }
//     if (!card || !Array.isArray(existingCard.positions)) {
//       return [];
//     }
//     const existingPositionsSelectOptions = existingCard.positions.map(
//       (pos: PositionObject) => ({
//         value: pos.position,
//         label: `${pos.position} - ${pos.articleNumber} - ${pos.articleName} - ${pos.quantity} ${pos.unit} - ${pos.identifier}`,
//       }),
//     );
//     return existingPositionsSelectOptions;
//   } catch (error) {
//     console.error(error);
//     throw new Error(
//       'An error occurred while retrieving the list of existing positions.',
//     );
//   }
// }

// // Finds the lowest free position for a given card
// export async function findLowestFreePosition(cardNumber: number) {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const collection = db.collection(collectionName);
//     const card = await collection.findOne({ number: cardNumber });
//     if (!card) {
//       throw new Error(`Card ${cardNumber} not found.`);
//     }
//     const positions = card.positions || [];
//     if (positions.length === 25) {
//       return 'full';
//     }
//     const usedPositions = positions.map((pos: PositionObject) => pos.position);
//     for (let i = 1; i <= 25; i++) {
//       if (!usedPositions.includes(i)) {
//         return i;
//       }
//     }
//     throw new Error('Unexpected error when searching for a free position.');
//   } catch (error) {
//     console.error(error);
//     throw new Error(
//       'An error occurred while searching for the lowest available position on the card.',
//     );
//   }
// }

// // Checks if a card is full
// export async function checkIsFull(cardNumber: number) {
//   const client = await clientPromise;
//   const db = client.db();
//   const collection = db.collection(collectionName);
//   const card = await collection.findOne({ number: cardNumber });
//   if (card?.position && card?.positions.length === 25) {
//     return true;
//   }
//   return false;
// }

// // Gets a position for a given card and position number
// export async function getPosition(
//   card: number,
//   position: number,
//   persons: PersonsType,
// ) {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const collection = db.collection(collectionName);
//     const existingCard = await collection.findOne({ number: card });

//     if (!existingCard) {
//       return { status: 'no card' };
//     }
//     if (
//       !existingCard.creators.includes(persons.first) ||
//       !existingCard.creators.includes(persons.second)
//     ) {
//       return { status: 'no access' };
//     }
//     if (position < 1 || position > 25) {
//       return { status: 'wrong position' };
//     }
//     if (!existingCard.positions) {
//       return { status: 'new' };
//     }
//     const positionOnCard = existingCard.positions.find(
//       (pos: { position: number }) => pos.position === position,
//     );

//     if (!positionOnCard) {
//       if (positionOnCard > existingCard.positions.length + 1) {
//         return {
//           status: 'skipped',
//           position: existingCard.positions.length + 1,
//         };
//       }
//       return { status: 'new' };
//     }
//     return {
//       status: 'found',
//       positionOnCard,
//     };
//   } catch (error) {
//     console.error(error);
//     throw new Error('An error occurred while retrieving the position.');
//   }
// }

// function generateIdentifier(
//   card: number,
//   position: number,
//   persons: PersonsType,
// ): string {
//   const personInitials =
//     getLastNameFirstLetter(persons.nameFirst || '') +
//     getLastNameFirstLetter(persons.nameSecond || '');
//   return `${card}${personInitials}${position}`;
// }

// // Saves a position to the database
// export async function savePosition(
//   card: number,
//   position: number,
//   articleNumber: number,
//   articleName: string,
//   quantity: number,
//   unit: string,
//   wip: boolean,
//   persons: PersonsType,
// ) {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const collection = db.collection(collectionName);

//     const identifier = generateIdentifier(card, position, persons);

//     const positionData = {
//       position: position,
//       identifier: identifier,
//       time: new Date(),
//       articleNumber: articleNumber,
//       articleName: articleName,
//       quantity: quantity,
//       unit: unit,
//       wip: wip,
//       persons: [persons.first, persons.second],
//     };
//     const updateResult = await collection.updateOne(
//       {
//         'number': card,
//         'positions.position': position,
//       },
//       {
//         $set: { 'positions.$': positionData },
//       },
//     );
//     if (updateResult.matchedCount === 0) {
//       const insertResult = await collection.updateOne(
//         { number: card },
//         {
//           $push: { positions: positionData },
//         },
//       );
//       if (insertResult.modifiedCount > 0) {
//         return { status: 'added', identifier };
//       } else {
//         return { status: 'not added' };
//       }
//     } else {
//       if (updateResult.modifiedCount > 0) {
//         return { status: 'updated', identifier };
//       } else {
//         return { status: 'not updated' };
//       }
//     }
//   } catch (error) {
//     console.error(error);
//     throw new Error('An error occurred while saving the position.');
//   }
// }
