import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { handleApiError } from '@/lib/api-error';

export async function GET() {
  try {
    const db = await getDb();
    const products = await db.collection('products').find({}).toArray();

    return NextResponse.json(
      { products },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
