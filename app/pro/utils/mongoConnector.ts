import { MongoClient, Collection } from 'mongodb'

export async function connectToMongo(
  collectionName: string
): Promise<Collection> {
  const client = new MongoClient(process.env.MONGO_URI as string)
  const dbName = 'next_bruss' // Replace with your DB name

  try {
    await client.connect()
    console.log('Connected successfully to MongoDB server') // success log

    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    return collection // <- return the collection here
  } catch (e) {
    console.error('Failed to connect to MongoDB', e)
    throw e // <- also good to throw the error so the calling function can handle it
  }
}
