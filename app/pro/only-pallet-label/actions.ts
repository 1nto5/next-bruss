'use server'
import { revalidatePath } from 'next/cache'
import { connectToMongo } from './mongoConnector'

export async function saveHydraBatch(hydraBatch: string) {
  try {
    const collection = await connectToMongo('only-pallet-label') // Pass the collection name to connectToMongo
    // now you have the collection and can insert, update, delete, etc.

    const result = await collection.insertOne({ hydraBatch }) // inserting the hydraBatch to the collection
    console.log(`Hydra batch inserted with _id: ${result.insertedId}`)
  } catch (error) {
    console.error('Failed to connect to MongoDB in saveHydraBatch', error)
  }
}
