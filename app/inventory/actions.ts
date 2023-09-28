'use server'

import { connectToMongo } from '@/lib/mongo/connector'
import crypto from 'crypto'
const moment = require('moment')

export async function GetExistingCardNumbers(email: string) {
  try {
    const collection = await connectToMongo('inventory_cards')
    const cardNumbers = await collection
      .find({ creator: email }, { projection: { _id: 0, number: 1 } })
      .toArray()
    const extractedNumbers = cardNumbers.map((card) => card.number)
    return extractedNumbers
  } catch (error) {
    console.error(error)
    throw new Error('Wystąpił błąd podczas pobierania listy numerów kart.')
  }
}

export async function FindLowestFreeCardNumber() {
  try {
    const collection = await connectToMongo('inventory_cards')
    const cardNumbers = await collection
      .find({}, { projection: { _id: 0, number: 1 } })
      .toArray()
    const sortedNumbers = cardNumbers
      .map((card) => card.number)
      .sort((a, b) => a - b)
    let lowestFreeNumber
    if (sortedNumbers[0] !== 1) {
      return 1
    }
    for (let i = 0; i < sortedNumbers.length - 1; i++) {
      if (sortedNumbers[i + 1] - sortedNumbers[i] > 1) {
        lowestFreeNumber = sortedNumbers[i] + 1
        break
      }
    }
    if (!lowestFreeNumber) {
      lowestFreeNumber = sortedNumbers[sortedNumbers.length - 1] + 1
    }
    return lowestFreeNumber
  } catch (error) {
    console.error(error)
    throw new Error(
      'An error occurred while retrieving the list of card numbers.'
    )
  }
}

export async function ReserveCard(cardNumber: number, email: string) {
  try {
    const collection = await connectToMongo('inventory_cards')
    const existingCard = await collection.findOne({ number: cardNumber })

    if (existingCard && existingCard.creator !== email) {
      return 'no access'
    }

    if (existingCard) {
      return 'exists'
    }

    const result = await collection.insertOne({
      number: cardNumber,
      creator: email,
    })

    if (result.insertedId) {
      return 'reserved'
    }
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while retrieving the list of articles.')
  }
}

export async function GetExistingPositions(cardNumber: number) {
  try {
    const collection = await connectToMongo('inventory_cards')
    const card = await collection.findOne({ number: cardNumber })
    if (!card || !Array.isArray(card.positions)) {
      return []
    }
    const existingPositions = card.positions.map((pos) => pos.position)
    return existingPositions
  } catch (error) {
    console.error(error)
    throw new Error(
      'An error occurred while retrieving the list of existing positions.'
    )
  }
}

export async function FindLowestFreePosition(cardNumber: number) {
  try {
    const existingPositions = await GetExistingPositions(cardNumber)
    if (existingPositions.length === 0) {
      return 1
    }
    if (existingPositions.length === 25) {
      return 'full'
    }
    const sortedPositions = existingPositions.sort((a, b) => a - b)
    for (let i = 1; i <= 25; i++) {
      if (!sortedPositions.includes(i)) {
        return i
      }
    }
    throw new Error('Nieoczekiwany błąd podczas wyszukiwania wolnej pozycji.')
  } catch (error) {
    console.error(error)
    throw new Error(
      'An error occurred while searching for the lowest available position on the card.'
    )
  }
}

export async function GetArticles() {
  try {
    const collection = await connectToMongo('inventory_articles')
    const articles = await collection.find({}).toArray()
    const formattedArticles = articles.map((article) => ({
      value: article.number as string,
      label: `${article.number} - ${article.name}` as string,
      number: article.number as number,
      name: article.name as string,
      unit: article.unit as string,
      converter: article.converter as number,
    }))
    return formattedArticles
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while retrieving the list of articles.')
  }
}

export async function GetPosition(cardNumber: number, positionNumber: number) {
  try {
    const collection = await connectToMongo('inventory_cards')
    const card = await collection.findOne({ number: cardNumber })

    if (!card) {
      return { status: 'no card' }
    }
    if (positionNumber < 1 || positionNumber > 25) {
      return { status: 'wrong position' }
    }
    if (!card.positions) {
      return { status: 'new' }
    }
    const position = card.positions.find(
      (pos: { position: number }) => pos.position === positionNumber
    )

    if (!position) {
      if (positionNumber > card.positions.length + 1) {
        return {
          status: 'skipped',
          position: card.positions.length,
        }
      }
      return { status: 'new' }
    }
    return {
      status: 'found',
      position,
    }
  } catch (error) {
    console.error(error)
    throw new Error('Wystąpił błąd podczas pobierania pozycji.')
  }
}

function generateUniqueIdentifier(): string {
  const year = new Date().getFullYear().toString().slice(-2)
  const week = moment().week().toString().padStart(2, '0')
  let randomLetters = ''
  while (randomLetters.length < 4) {
    const randomBytes = crypto.randomBytes(3).toString('base64')
    const extractedLetters = randomBytes.replace(/[^a-zA-Z]/g, '')
    randomLetters += extractedLetters
  }
  randomLetters = randomLetters.substring(0, 4).toUpperCase()
  return `${year}${randomLetters}${week}`
}

export async function SavePosition(
  cardNumber: number,
  position: number,
  articleNumber: number,
  articleName: string,
  quantity: number,
  unit: string,
  wip: boolean,
  user: string
) {
  try {
    const collection = await connectToMongo('inventory_cards')
    let isUnique = false
    let identifier
    while (!isUnique) {
      identifier = generateUniqueIdentifier()
      const allIdentifiers = await collection
        .find({}, { projection: { 'positions.identifier': 1 } })
        .toArray()

      const existingIdentifiers = allIdentifiers.flatMap((card) =>
        Array.isArray(card.positions)
          ? card.positions.map((pos) => pos.identifier)
          : []
      )

      if (!existingIdentifiers.includes(identifier)) {
        isUnique = true
      }
    }
    const currentDate = new Date().toISOString()
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
    }
    const updateResult = await collection.updateOne(
      {
        number: cardNumber,
        'positions.position': position,
      },
      {
        $set: { 'positions.$': positionData },
      }
    )
    if (updateResult.matchedCount === 0) {
      const insertResult = await collection.updateOne(
        { number: cardNumber },
        {
          $push: { positions: positionData },
        }
      )
      if (insertResult.modifiedCount > 0) {
        return { status: 'added', identifier }
      } else {
        return { status: 'not added' }
      }
    } else {
      if (updateResult.modifiedCount > 0) {
        return { status: 'updated', identifier }
      } else {
        return { status: 'not updated' }
      }
    }
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while saving the position.')
  }
}
