import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

export async function getDb() {
  if (cachedDb) return cachedDb;
  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(process.env.MONGO_URL, {
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
      });
      await cachedClient.connect();
    }
    cachedDb = cachedClient.db(process.env.DB_NAME);
    return cachedDb;
  } catch (err) {
    cachedClient = null;
    cachedDb = null;
    console.error('[MongoDB] Connection failed:', err.message);
    throw err;
  }
}
