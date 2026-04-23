import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const idParam = resolvedParams.id;
    
    // Attempt to parse ID as a number
    const productId = parseInt(idParam, 10);

    const db = await getDb();
    
    // Search by numeric ID or slug string
    const query = isNaN(productId) 
      ? { slug: idParam } 
      : { $or: [{ id: productId }, { slug: idParam }] };

    const product = await db.collection('products').findOne(query);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { product },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Failed to fetch product:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
