'use server';

// Database connection import - using custom dbc wrapper for MongoDB
import { dbc } from '@/lib/db/mongo';

// Type definitions
import { loginInventoryType } from './lib/zod';

/**
 * Authenticates users for inventory access
 * @param data - Login credentials including personal numbers and PINs
 * @returns Success status or error message
 */
export async function login(data: loginInventoryType) {
  try {
    const collection = await dbc('employees');

    const person1 = await collection.findOne({
      identifier: data.personalNumber1,
    });
    if (!person1) {
      return { error: 'wrong number 1' };
    }
    if (data.pin1 !== person1.pin) {
      return { error: 'wrong pin 1' };
    }

    if (data.personalNumber2) {
      const person2 = await collection.findOne({
        identifier: data.personalNumber2,
      });
      if (!person2) {
        return { error: 'wrong number 2' };
      }
      if (data.pin2 !== person2.pin) {
        return { error: 'wrong pin 2' };
      }
    }

    if (data.personalNumber3) {
      const person3 = await collection.findOne({
        identifier: data.personalNumber3,
      });
      if (!person3) {
        return { error: 'wrong number 3' };
      }
      if (data.pin3 !== person3.pin) {
        return { error: 'wrong pin 3' };
      }
    }
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return { error: 'login server action error' };
  }
}

/**
 * Creates a new inventory card with the next available number
 * @param persons - Array of person identifiers who are creating the card
 * @param warehouse - Warehouse identifier
 * @param sector - Sector within the warehouse
 * @returns Success status with new card number or error message
 */
export async function createNewCard(
  persons: string[],
  warehouse: string,
  sector: string,
) {
  try {
    const coll = await dbc('inventory_cards');

    // Pobierz wszystkie istniejące numery kart
    const existingCards = await coll
      .find({}, { projection: { number: 1 } })
      .sort({ number: 1 })
      .toArray();
    const existingNumbers = existingCards.map((card) => card.number);

    // Znajdź najniższy wolny numer
    let newCardNumber = 1;
    for (let i = 0; i < existingNumbers.length; i++) {
      if (existingNumbers[i] !== newCardNumber) {
        break; // Znaleziono wolny numer
      }
      newCardNumber++;
    }

    // Tworzenie nowej karty z najniższym wolnym numerem
    const result = await coll.insertOne({
      number: newCardNumber,
      creators: persons,
      warehouse: warehouse,
      sector: sector,
      time: new Date(),
    });

    if (result.insertedId) {
      return { success: true, cardNumber: newCardNumber };
    }
    return { error: 'not created' };
  } catch (error) {
    console.error(error);
    return { error: 'createNewCard server action error' };
  }
}

/**
 * Retrieves all inventory cards created by specific persons
 * @param persons - Array of person identifiers to filter cards by
 * @returns Array of cards or error message
 */
export async function fetchCards(persons: string[]) {
  try {
    // const timeout = (ms: number) =>
    //   new Promise((resolve) => setTimeout(resolve, ms));
    // await timeout(2000);
    const coll = await dbc('inventory_cards');
    const cards = await coll
      .find({
        creators: {
          $all: persons,
        },
      })
      .toArray();
    if (cards.length === 0) {
      return { message: 'no cards' };
    }
    const sanitizedCards = cards.map(({ _id, ...rest }) => rest);
    return { success: sanitizedCards };
  } catch (error) {
    console.error(error);
    return { error: 'fetchCards server action error' };
  }
}

/**
 * Fetches all positions for a specific inventory card
 * @param persons - Array of person identifiers for authorization
 * @param cardNumber - The card number to fetch positions for
 * @returns Array of positions or error message
 */
export async function fetchCardPositions(
  persons: string[],
  cardNumber: number,
) {
  try {
    // const timeout = (ms: number) =>
    //   new Promise((resolve) => setTimeout(resolve, ms));
    // await timeout(2000);
    const coll = await dbc('inventory_cards');
    const card = await coll.findOne({
      number: Number(cardNumber),
    });
    if (!card) {
      return { error: 'no card' };
    }
    if (
      !card.creators ||
      !card.creators.some((c: string) => persons.includes(c))
    ) {
      return { error: 'not authorized' };
    }
    if (!card.positions) {
      return { message: 'no positions' };
    }
    return { success: card.positions };
  } catch (error) {
    console.error(error);
    return { error: 'fetchCardPositions server action error' };
  }
}

/**
 * Fetches a specific position from an inventory card
 * @param persons - Array of person identifiers for authorization
 * @param cardNumber - The card number containing the position
 * @param position - The position number to fetch (1-25)
 * @returns Position details or error message
 */
export async function fetchPosition(
  persons: string[],
  cardNumber: number,
  position: number,
) {
  try {
    // const timeout = (ms: number) =>
    //   new Promise((resolve) => setTimeout(resolve, ms));
    // await timeout(1000);

    const coll = await dbc('inventory_cards');
    const existingCard = await coll.findOne({
      number: cardNumber,
    });
    if (!existingCard) {
      return { error: 'no card' };
    }
    if (position < 1 || position > 25) {
      return { error: 'wrong position' };
    }
    if (
      !existingCard.creators ||
      !existingCard.creators.some((c: string) => persons.includes(c))
    ) {
      return { error: 'not authorized' };
    }
    if (!existingCard.positions) {
      return { message: 'no positions' };
    }
    const positionOnCard = existingCard.positions.find(
      (pos: { position: number }) => pos.position === position,
    );

    if (!positionOnCard) {
      return { message: 'no position' };
    }
    return { success: positionOnCard };
  } catch (error) {
    console.error(error);
    return { error: 'fetchPosition server action error' };
  }
}

/**
 * Retrieves basic information about a specific inventory card
 * @param cardNumber - The card number to get info for
 * @returns Card information or error if not found
 */
export async function getCardInfo(cardNumber: string) {
  try {
    const coll = await dbc('inventory_cards');
    const res = await coll.findOne({ number: Number(cardNumber) });
    if (!res) {
      return { error: 'no card' };
    }
    return {
      number: res.number,
      warehouse: res.warehouse,
      sector: res.sector,
      creators: res.creators,
    };
  } catch (error) {
    console.error('getCardInfo error:', error);
    return { error: 'database error' };
  }
}

/**
 * Searches for inventory articles by number or name
 * @param search - Search term to match against article numbers or names
 * @returns Matching articles (max 5) or error message
 */
export async function findArticles(search: string) {
  try {
    const coll = await dbc('inventory_articles');
    const results = await coll
      .find({
        $or: [
          { number: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
        ],
      })
      .toArray();

    if (results.length === 0) {
      return { error: 'no articles' };
    }

    if (results.length > 5) {
      return { error: 'too many articles' };
    }
    const sanitizedResults = results.map(({ _id, ...rest }) => rest);
    return { success: sanitizedResults };
  } catch (error) {
    console.error(error);
    return { error: 'findArticles server action error' };
  }
}

/**
 * Searches for bin locations in the warehouse
 * @param search - Search term to match against bin values
 * @returns Matching bins (max 10) or error message
 */
export async function findBins(search: string) {
  try {
    const coll = await dbc('inventory_bin_options');

    // Normalize search: remove non-alphanumerics, lowercase
    const normalize = (str: string) =>
      str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    const normalizedSearch = normalize(search);

    // Fetch all bins, then filter in-memory for normalized match
    const results = await coll.find({}).toArray();

    const filtered = results.filter((bin) =>
      normalize(bin.value).includes(normalizedSearch),
    );

    if (filtered.length === 0) {
      return { error: 'no bins' };
    }

    if (filtered.length > 10) {
      return { error: 'too many bins' };
    }

    const sanitizedResults = filtered.map(({ _id, ...rest }) => rest);
    return { success: sanitizedResults };
  } catch (error) {
    console.error(error);
    return { error: 'findBins server action error' };
  }
}

/**
 * Saves or updates an inventory position
 * @param card - Card number
 * @param position - Position number on the card (1-25)
 * @param articleNumber - Article identifier
 * @param articleName - Article display name
 * @param quantity - Item quantity (must be integer if unit is 'st')
 * @param unit - Measurement unit
 * @param wip - Work in progress flag
 * @param bin - Optional bin location
 * @param deliveryDate - Optional delivery date
 * @returns Success/error status with operation details
 */
export async function savePosition(
  card: number,
  position: number,
  articleNumber: number,
  articleName: string,
  quantity: number,
  unit: string,
  wip: boolean,
  bin?: string,
  deliveryDate?: Date,
) {
  try {
    const collection = await dbc('inventory_cards');

    const identifier = `${card}/${position}`;

    if (!quantity) {
      return { error: 'wrong quantity' };
    }

    if (unit === 'st' && !Number.isInteger(quantity)) {
      return { error: 'wrong quantity' };
    }

    const positionData = {
      position: position,
      identifier: identifier,
      time: new Date(),
      articleNumber: articleNumber,
      articleName: articleName,
      quantity: quantity,
      unit: unit,
      wip: wip,
      bin: bin, // Add bin field
      deliveryDate: deliveryDate, // Add delivery date field
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
        return { success: 'added', identifier };
      } else {
        return { error: 'not added' };
      }
    } else {
      if (updateResult.modifiedCount > 0) {
        return { success: 'updated', identifier };
      } else {
        return { error: 'not updated' };
      }
    }
  } catch (error) {
    console.error(error);
    return { error: 'savePosition server action error' };
  }
}
