import { MongoClient, Collection } from 'mongodb'

export async function connectToMongo(
  collectionName: string
): Promise<Collection> {
  const client = new MongoClient(process.env.MONGO_URI as string)
  const dbName = 'bruss'

  try {
    await client.connect()
    console.log('Connected successfully to MongoDB server')

    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    return collection
  } catch (e) {
    console.error('Failed to connect to MongoDB', e)
    throw e
  }
}
