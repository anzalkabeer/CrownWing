import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { collectionItems } from '@/lib/data';
import { handleApiError } from '@/lib/api-error';

export async function GET() {
  try {
    const db = await getDb();
    const productsCollection = db.collection('products');

    // Check if products already exist
    const count = await productsCollection.countDocuments();
    if (count > 0) {
      return NextResponse.json({ message: 'Database already seeded' }, { status: 200 });
    }

    // Insert all static items into the DB
    const result = await productsCollection.insertMany(collectionItems);

    return NextResponse.json({ 
      message: 'Database seeded successfully', 
      insertedCount: result.insertedCount 
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
