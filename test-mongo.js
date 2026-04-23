require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri ? uri.replace(/:([^:@]{3,})@/, ':***@') : 'undefined');

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    const db = client.db('crownwing');
    const collections = await db.collections();
    console.log("Collections:", collections.map(c => c.collectionName));
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await client.close();
  }
}
run();
