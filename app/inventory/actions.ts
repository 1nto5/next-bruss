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
      return 'reserved'
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
    const card = await collection.findOne(
      { number: cardNumber },
      { projection: { positions: 1 } }
    )
    if (!card || !card.positions) return []
    const existingPositions = Object.keys(card.positions).map(Number)
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

export async function GetArticlesOptions() {
  try {
    const collection = await connectToMongo('inventory_articles')
    const articles = await collection.find({}).toArray()
    const formattedArticles = articles.map((article) => ({
      value: article.number,
      label: `${article.number} - ${article.name}`,
    }))
    return formattedArticles
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while retrieving the list of articles.')
  }
}

type ArticleConfig = {
  number: number
  name: string
  unit: string
  converter?: number
}

export async function GetArticleConfig(article: number) {
  try {
    const collection = await connectToMongo('inventory_articles')
    const articleObject = await collection.findOne({ number: article })
    if (articleObject) {
      const { number, name, unit, converter } = articleObject
      const config: ArticleConfig = { number, name, unit }
      if (converter !== undefined) {
        config.converter = converter
      }
      return config
    }

    return null
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while getting article config.')
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

type PositionData = {
  article: number
  quantity: number
  unit: string
  wip: boolean
  user: string
}

export async function SavePosition(
  cardNumber: number,
  positionNumber: number,
  positionData: PositionData
) {
  try {
    const cardCollection = await connectToMongo('inventory_cards')
    const identifierCollection = await connectToMongo('inventory_identifiers')
    let isUnique = false
    let identifier
    while (!isUnique) {
      identifier = generateUniqueIdentifier()
      // identifier = '23PHZJ39'
      console.log('tu')
      const existing = await identifierCollection.findOne({
        identifier: identifier,
      })
      if (!existing) {
        isUnique = true
        await identifierCollection.insertOne({ identifier: identifier })
      }
    }
    const currentDate = new Date().toISOString()
    const finalPositionData = { ...positionData, identifier, time: currentDate }

    const save = await cardCollection.updateOne(
      { number: cardNumber },
      {
        $set: { [`positions.${positionNumber}`]: finalPositionData },
      }
    )
    if (save.modifiedCount > 0) {
      return { status: 'saved', identifier }
    } else {
      return { status: 'not saved' }
    }
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while saving the position.')
  }
}
