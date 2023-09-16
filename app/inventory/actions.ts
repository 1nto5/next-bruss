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
