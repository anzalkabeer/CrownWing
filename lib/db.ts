import { getDb } from './mongodb';

export interface User {
  id: string;        // The "Special Primary Key"
  email: string;     // Unique Candidate Key
  passwordHash: string;
  name: string;
  phone?: string;    // Optional or required depending on the use case
  authProvider?: string; // e.g. 'google', 'apple', or undefined for password
  createdAt: string;
}

/**
 * Generate the "Special Primary Key" in format CW-26-XXXX.
 * Uses a counters collection in MongoDB to ensure auto-incrementing unique IDs.
 */
export async function generateNextUserId(): Promise<string> {
  const db = await getDb();
  const counter = await db.collection('counters').findOneAndUpdate(
    { _id: 'userId' },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );

  if (!counter || typeof counter.seq !== 'number') {
    throw new Error('Failed to generate unique user ID: counter is null or undefined.');
  }

  const sequenceNumber = counter.seq;
  
  if (sequenceNumber > 9999) {
    throw new Error('Maximum user ID limit exceeded (9999).');
  }

  // Pad with zeros to 4 digits (e.g., 0001)
  const paddedNumber = sequenceNumber.toString().padStart(4, '0');
  
  return `CW-26-${paddedNumber}`;
}

/**
 * Initialize MongoDB collection with unique index for Email.
 */
async function ensureIndexes() {
  const db = await getDb();
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ id: 1 }, { unique: true });
}

ensureIndexes().catch((err) => {
  console.error("Failed to ensure MongoDB indexes. Exiting...", err);
  process.exit(1);
});

/**
 * Internal lookup by email for authentication purposes only.
 * Email is a candidate key, not the primary identifier.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ email });
  if (!user) return null;

  return {
    id: user.id,
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
  const user = await db.collection('users').findOne({ id });
  if (!user) return null;

  return {
    id: user.id,
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
export async function saveUser(user: User): Promise<void> {
  const db = await getDb();
  await db.collection('users').insertOne({
    ...user,
    updatedAt: new Date().toISOString()
  });
}
