import { MongoClient, Collection } from 'mongodb'

let client: MongoClient | null = null

export async function connectToMongo(
  collectionName: string
): Promise<Collection> {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI as string)
    const dbName = process.env.DB_NAME

    try {
      await client.connect()
      // console.log('Connected successfully to MongoDB server')
    } catch (e) {
      console.error('Failed to connect to MongoDB', e)
      throw e
    }
  }

  const db = client.db(process.env.DB_NAME as string)
  const collection = db.collection(collectionName)
  return collection
}
