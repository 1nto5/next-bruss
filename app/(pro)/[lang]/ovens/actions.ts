'use server';

// import clientPromise from '@/lib/mongo';
import { dbc } from '@/lib/mongo';
import { getLastNameFirstLetter } from '@/lib/utils/name-format';

import { loginInventoryType } from './lib/zod';

export async function login(data: loginInventoryType) {
  try {
    const collection = await dbc('persons');

    const person1 = await collection.findOne({
      personalNumber: data.personalNumber1,
    });
    if (!person1) {
      return { error: 'wrong number 1' };
    }
    if (data.pin1 !== person1.password) {
      return { error: 'wrong pin 1' };
    }

    if (data.personalNumber2) {
      const person2 = await collection.findOne({
        personalNumber: data.personalNumber2,
      });
      if (!person2) {
        return { error: 'wrong number 2' };
      }
      if (data.pin2 !== person2.password) {
        return { error: 'wrong pin 2' };
      }
    }

    if (data.personalNumber3) {
      const person3 = await collection.findOne({
        personalNumber: data.personalNumber3,
      });
      if (!person3) {
        return { error: 'wrong number 3' };
      }
      if (data.pin3 !== person3.password) {
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
    console.error(error);
    throw new Error('getCardInfo server action error');
  }
}

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

    // Sprawdzenie liczby wyników
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

export async function savePosition(
  card: number,
  position: number,
  articleNumber: number,
  articleName: string,
  quantity: number,
  unit: string,
  wip: boolean,
) {
  try {
    // const timeout = (ms: number) =>
    //   new Promise((resolve) => setTimeout(resolve, ms));
    // await timeout(2000);

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
