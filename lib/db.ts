import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

export interface User {
  id?: string;       // Maps to MongoDB _id string
  email: string;     // Unique Candidate Key
  passwordHash: string;
  name: string;
  phone?: string;    // Optional or required depending on the use case
  authProvider?: string; // e.g. 'google', 'apple', or undefined for password
  createdAt: string;
}




let indexesReady = false;

export function isIndexesReady() {
  return indexesReady;
}

/**
 * Initialize MongoDB collection with unique index for Email.
 * Runs asynchronously. We do NOT exit the process on failure 
 * to prevent Vercel Serverless Function cold-start crashes.
 */
async function ensureIndexes() {
  try {
    const db = await getDb();
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    indexesReady = true;
  } catch (err) {
    console.error("Failed to ensure MongoDB indexes. Check your Atlas IP Whitelist (0.0.0.0/0).", err);
    indexesReady = false;
  }
}

// Fire and forget
ensureIndexes();

/**
 * Internal lookup by email for authentication purposes only.
 * Email is a candidate key, not the primary identifier.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ email });
  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

/**
 * Fetch a user by ID from MongoDB.
 */
export async function getUserById(id: string): Promise<User | null> {
  const db = await getDb();
  // Using native _id for lookups
  let query: any;
  try {
    query = { _id: new ObjectId(id) };
  } catch (e) {
    // If id is not a valid ObjectId (maybe old data), fallback or return null
    return null;
  }

  const user = await db.collection('users').findOne(query);
  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

/**
 * Save a new user to MongoDB.
 */
export async function saveUser(user: User): Promise<string> {
  if (!isIndexesReady()) {
    throw new Error('Database not ready. Indexes are still initializing or failed to initialize.');
  }
  const db = await getDb();
  
  // We remove 'id' if it exists and let MongoDB handle _id
  const { id, ...userData } = user;
  const result = await db.collection('users').insertOne({
    ...userData,
    updatedAt: new Date().toISOString()
  });

  return result.insertedId.toString();
}
