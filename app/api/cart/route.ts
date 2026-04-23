import { NextResponse, NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

// Helper to get or create a session/cart ID
function getCartSession(request: NextRequest): { sessionId: string; isNew: boolean } {
  // First try to authenticate
  const token = request.cookies.get('token')?.value;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) return { sessionId: decoded.userId, isNew: false };
  }

  // Fallback to guest cart session
  let guestId = request.cookies.get('guestCartId')?.value;
  let isNew = false;
  if (!guestId) {
    guestId = crypto.randomUUID();
    isNew = true;
  }
  return { sessionId: guestId, isNew };
}

export async function GET(request: NextRequest) {
  try {
    const { sessionId, isNew } = getCartSession(request);
    
    let cart = null;
    if (!isNew) {
      const db = await getDb();
      cart = await db.collection('carts').findOne({ sessionId });
    }

    const response = NextResponse.json({ items: cart?.items || [] }, { status: 200 });

    if (isNew) {
      response.cookies.set('guestCartId', sessionId, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Cart GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, quantity = 1 } = body;

    if (!product || !product.id) {
      return NextResponse.json({ error: 'Valid product is required' }, { status: 400 });
    }

    const { sessionId, isNew } = getCartSession(request);
    const db = await getDb();
    
    // Upsert logic for cart
    const cartCollection = db.collection('carts');
    const existingCart = await cartCollection.findOne({ sessionId });

    let items = existingCart?.items || [];
    
    // Check if item exists in cart
    const existingItemIndex = items.findIndex((item: any) => item.id === product.id);
    
    if (existingItemIndex > -1) {
      items[existingItemIndex].quantity += quantity;
    } else {
      items.push({ ...product, quantity });
    }

    await cartCollection.updateOne(
      { sessionId },
      { $set: { items, updatedAt: new Date() } },
      { upsert: true }
    );

    const response = NextResponse.json({ message: 'Added to cart', items }, { status: 200 });

    if (isNew) {
      response.cookies.set('guestCartId', sessionId, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Cart POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { sessionId } = getCartSession(request);
    const db = await getDb();
    
    const cartCollection = db.collection('carts');
    
    // Only proceed if cart exists
    const cart = await cartCollection.findOne({ sessionId });
    if (!cart) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    // Parse ID (assuming numeric ID based on previous code)
    const pId = parseInt(productId, 10);
    const newItems = cart.items.filter((item: any) => item.id !== pId);

    await cartCollection.updateOne(
      { sessionId },
      { $set: { items: newItems, updatedAt: new Date() } }
    );

    return NextResponse.json({ message: 'Item removed', items: newItems }, { status: 200 });
  } catch (error) {
    console.error('Cart DELETE Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
