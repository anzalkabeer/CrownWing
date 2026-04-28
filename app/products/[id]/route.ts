import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { handleApiError, AppError } from '@/lib/api-error';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    
    // Attempt to parse ID as a number
    const productId = parseInt(idParam, 10);

    const db = await getDb();
    
    // Search by numeric ID or slug string
    const query = isNaN(productId) 
      ? { slug: idParam } 
      : { $or: [{ id: productId }, { slug: idParam }] };

    const product = await db.collection('products').findOne(query);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return NextResponse.json(
      { product },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
