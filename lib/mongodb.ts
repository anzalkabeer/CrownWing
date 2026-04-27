import { MongoClient, ServerApiVersion } from 'mongodb';

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

// Global cache for dev mode HMR
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

let clientPromise: Promise<MongoClient> | null = null;

// Lazy initialization — only connects when actually needed
function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise;

  // Support both env var names for backward compatibility
  const uri = process.env.MONGODB_URI || process.env.CROWNWING_DB_URI;

  if (!uri) {
    throw new Error(
      'Missing MongoDB connection string. Set MONGODB_URI in your .env.local file.'
    );
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  // Use explicit database name
  return client.db('crownwing');
}

export default getClientPromise;
