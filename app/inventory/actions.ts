'use server'

import { connectToMongo } from '@/lib/mongo/connector'

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

export async function SavePosition(
  cardNumber: number,
  positionNumber: number,
  positionData: any
) {
  try {
    const collection = await connectToMongo('inventory_cards')
    const save = await collection.updateOne(
      { number: cardNumber },
      {
        $set: {
          [`positions.${positionNumber}`]: positionData,
        },
      }
    )
    if (save) {
      return 'saved'
    }
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while saving the position.')
  }
}
