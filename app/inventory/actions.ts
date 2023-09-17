'use server'

import { connectToMongo } from '@/lib/mongo/connector'

const collectionName = 'inventory'

export async function GetArticles() {
  try {
    // Połącz z bazą danych MongoDB
    const collection = await connectToMongo('inventory_articles')

    // Znajdź wszystkie artykuły
    const articles = await collection.find({}).toArray()

    // Przygotuj dane w formie 'numer - nazwa'
    const formattedArticles = articles.map(
      (article) => `${article.number} - ${article.name}`
    )

    return formattedArticles
  } catch (error) {
    console.error(error)
    throw new Error('Wystąpił błąd podczas pobierania listy artykułów.')
  }
}

export async function GetCard(cardNumber = 1) {
  try {
    const collection = await connectToMongo('inventory_cards')

    const card = await collection.findOne({ number: cardNumber })

    if (!card) throw new Error('Nie znaleziono karty.')

    return card
  } catch (error) {
    console.error(error)
    throw new Error('Wystąpił błąd podczas pobierania karty.')
  }
}

export async function UpdateCard(cardNumber, cardData) {
  try {
    const collection = await connectToMongo('inventory_cards')

    const { matchedCount, modifiedCount } = await collection.updateOne(
      { number: cardNumber },
      { $set: cardData }
    )

    if (matchedCount && modifiedCount) {
      return { success: true }
    }

    throw new Error('Nie udało się zaktualizować karty.')
  } catch (error) {
    console.error(error)
    throw new Error('Wystąpił błąd podczas aktualizacji karty.')
  }
}
