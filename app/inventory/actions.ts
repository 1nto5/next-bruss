'use server'

import { connectToMongo } from '@/lib/mongo/connector'

export async function GetExistingCardNumbers(email: string) {
  try {
    const collection = await connectToMongo('inventory_cards')

    // Pobierz wszystkie numery kart z bazy danych, gdzie creator równa się email
    const cardNumbers = await collection
      .find({ creator: email }, { projection: { _id: 0, number: 1 } })
      .toArray()

    // Wyciągnij tylko numery kart
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

    // Pobierz wszystkie numery kart z bazy danych
    const cardNumbers = await collection
      .find({}, { projection: { _id: 0, number: 1 } })
      .toArray()

    // Wyciągnij same numery kart i posortuj je rosnąco
    const sortedNumbers = cardNumbers
      .map((card) => card.number)
      .sort((a, b) => a - b)

    let lowestFreeNumber

    // Jeśli pierwsza karta nie ma numeru 1, to 1 jest wolnym numerem
    if (sortedNumbers[0] !== 1) {
      return 1
    }

    // Przeszukaj posortowaną listę, aby znaleźć najniższą lukę
    for (let i = 0; i < sortedNumbers.length - 1; i++) {
      if (sortedNumbers[i + 1] - sortedNumbers[i] > 1) {
        lowestFreeNumber = sortedNumbers[i] + 1
        break
      }
    }

    // Jeśli nie znaleziono luki, to najniższy wolny numer to ostatni numer plus jeden
    if (!lowestFreeNumber) {
      lowestFreeNumber = sortedNumbers[sortedNumbers.length - 1] + 1
    }

    return lowestFreeNumber
  } catch (error) {
    console.error(error)
    throw new Error(
      'Wystąpił błąd podczas wyszukiwania najniższego wolnego numeru karty.'
    )
  }
}

export async function ReserveCard(cardNumber: number, email: string) {
  try {
    const collection = await connectToMongo('inventory_cards')

    // Sprawdź, czy dany numer karty jest już zarezerwowany
    const existingCard = await collection.findOne({ number: cardNumber })

    if (existingCard) {
      return { status: 'exists' }
    }

    // Dodaj nową kartę do kolekcji z przekazanym numerem i emailem jako twórcą
    const result = await collection.insertOne({
      number: cardNumber,
      creator: email,
    })

    if (result.insertedId) {
      return { status: 'reserved' }
    } else {
      return { status: 'error' }
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

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

export async function GetExistingPositions(cardNumber: number) {
  try {
    const collection = await connectToMongo('inventory_cards')

    const positionNumbers = await collection
      .find({ cardNumber }, { projection: { _id: 0, number: 1 } })
      .toArray()

    const extractedNumbers = positionNumbers.map((card) => card.number)

    return extractedNumbers
  } catch (error) {
    console.error(error)
    throw new Error('Wystąpił błąd podczas pobierania listy numerów kart.')
  }
}

export async function FindLowestFreePosition(cardNumber: number) {
  try {
    const collection = await connectToMongo('inventory_cards')

    const positionNumbers = await collection
      .find({ cardNumber }, { projection: { _id: 0, number: 1 } })
      .toArray()

    // Wyciągnij tylko numery pozycji
    const extractedNumbers = positionNumbers.map((position) => position.number)

    // Jeśli nie ma pozycji na karcie, zwróć 1
    if (extractedNumbers.length === 0) {
      return 1
    }

    // Jeśli jest 25 pozycji, zwróć status "full"
    if (extractedNumbers.length === 25) {
      return 'full'
    }

    // Posortuj numery pozycji rosnąco
    const sortedNumbers = extractedNumbers.sort((a, b) => a - b)

    for (let i = 1; i <= 25; i++) {
      if (!sortedNumbers.includes(i)) {
        return i
      }
    }

    // Teoretycznie ten fragment nigdy nie powinien zostać osiągnięty z powodu wcześniejszych warunków, ale warto mieć pewność.
    throw new Error('Nieoczekiwany błąd podczas wyszukiwania wolnej pozycji.')
  } catch (error) {
    console.error(error)
    throw new Error(
      'Wystąpił błąd podczas wyszukiwania najniższej wolnej pozycji na karcie.'
    )
  }
}
