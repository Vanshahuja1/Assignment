import { MongoClient, type Db, type Collection } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  const client = new MongoClient(mongoUri)
  await client.connect()
  const db = client.db("xray")

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function getExecutionsCollection(): Promise<Collection> {
  const { db } = await connectToDatabase()
  const collection = db.collection("executions")

  await collection.createIndex({ executionId: 1 }, { unique: true })
  await collection.createIndex({ createdAt: -1 })
  await collection.createIndex({ status: 1 })

  return collection
}

export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
  }
}
