import { MongoClient, type Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedClientPromise: Promise<MongoClient> | null = null;
let cachedUri = "";

function getMongoUri() {
  const candidates = [
    process.env.MONGODB_URI,
    process.env.MONGO_URI,
    process.env.DATABASE_URL,
  ];

  return (
    candidates.find((value) => typeof value === "string" && value.trim().startsWith("mongodb"))?.trim() ||
    ""
  );
}

function getDatabaseName(uri: string) {
  const configuredName =
    process.env.MONGODB_DB ||
    process.env.MONGO_DB ||
    process.env.MONGO_DATABASE ||
    process.env.DB_NAME;

  if (configuredName?.trim()) return configuredName.trim();

  try {
    const parsed = new URL(uri);
    const databaseName = parsed.pathname.replace(/^\/+/, "").split("/")[0];
    return databaseName || undefined;
  } catch {
    return undefined;
  }
}

export function hasMongoConnectionConfig() {
  return Boolean(getMongoUri());
}

async function getMongoClient() {
  const uri = getMongoUri();
  if (!uri) return null;

  if (cachedClient && cachedUri === uri) return cachedClient;

  if (!cachedClientPromise || cachedUri !== uri) {
    cachedUri = uri;
    cachedClientPromise = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5_000,
    }).connect();
  }

  cachedClient = await cachedClientPromise;
  return cachedClient;
}

export async function getMongoDb(): Promise<Db | null> {
  const uri = getMongoUri();
  const client = await getMongoClient();
  if (!uri || !client) return null;
  return client.db(getDatabaseName(uri));
}
