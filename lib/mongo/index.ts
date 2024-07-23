import { MongoClient } from 'mongodb';

const URI = process.env.MONGO_URI;
const options = {
  serverSelectionTimeoutMS: 3000,
};

if (!URI) {
  throw new Error(
    'Please define the MONGO_URI environment variable inside .env!',
  );
}

let client = new MongoClient(URI, options);
let clientPromise: Promise<MongoClient>;

let globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClientPromise) {
  client = new MongoClient(URI, options);
  globalWithMongo._mongoClientPromise = client.connect();
}

clientPromise = globalWithMongo._mongoClientPromise;

export default clientPromise;

// slow migration to:

export async function dbc(collectionName: string) {
  const client = await clientPromise;
  const db = client.db();
  return db.collection(collectionName);
}
