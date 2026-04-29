import { NextResponse, NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { AppError, handleApiError } from '@/lib/api-error';
import { collectionItems } from '@/lib/data';
import { assertTrustedOrigin } from '@/lib/security';

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
    
    let cartDoc: any = null;
    if (!isNew) {
      const db = await getDb();
      cartDoc = await db.collection('carts').findOne({ sessionId });
    }

    // Default structure if missing
    if (!cartDoc) {
      cartDoc = {
        sessionId,
        activeCartId: "cart_1",
        carts: [{ id: "cart_1", name: "Cart No.1", items: [] }]
      };
    }

    const response = NextResponse.json({
      activeCartId: cartDoc.activeCartId,
      carts: cartDoc.carts || []
    }, { status: 200 });

    if (isNew) {
      response.cookies.set('guestCartId', sessionId, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertTrustedOrigin(request);

    const body = await request.json();
    const { product, quantity = 1 } = body;

    // Validate product
    if (!product || typeof product !== 'object' || !product.id) {
      throw new AppError('A valid product with an id is required.', 400);
    }

    // Validate quantity
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new AppError('Quantity must be an integer between 1 and 20.', 400);
    }

    const productId = Number(product.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      throw new AppError('Product id must be a valid integer.', 400);
    }

    const trustedProduct = collectionItems.find((p) => p.id === productId);
    if (!trustedProduct) {
      throw new AppError('Product not found.', 404);
    }

    const { sessionId, isNew } = getCartSession(request);
    const db = await getDb();
    
    // Upsert logic for multi-cart
    const cartCollection = db.collection('carts');
    let cartDoc: any = await cartCollection.findOne({ sessionId });

    if (!cartDoc) {
      cartDoc = {
        sessionId,
        activeCartId: "cart_1",
        carts: [{ id: "cart_1", name: "Cart No.1", items: [] }]
      };
    }

    const carts = cartDoc.carts || [];
    const activeCartId = cartDoc.activeCartId || "cart_1";
    
    const cartIndex = carts.findIndex((c: any) => c.id === activeCartId);
    if (cartIndex === -1) {
      carts.push({ id: activeCartId, name: "Cart No.1", items: [] });
    }

    const targetCart = carts.find((c: any) => c.id === activeCartId);
    let items = targetCart.items || [];
    
    // Check if item exists in cart
    const existingItemIndex = items.findIndex((item: any) => item.id === trustedProduct.id);
    
    if (existingItemIndex > -1) {
      const nextQuantity = Number(items[existingItemIndex].quantity || 0) + quantity;
      if (nextQuantity > 20) {
        throw new AppError('Maximum quantity per item is 20.', 400);
      }
      items[existingItemIndex].quantity = nextQuantity;
    } else {
      items.push({
        id: trustedProduct.id,
        name: trustedProduct.name,
        price: trustedProduct.price,
        image: trustedProduct.image,
        quantity,
      });
    }

    targetCart.items = items;

    await cartCollection.updateOne(
      { sessionId },
      { $set: { carts, activeCartId, updatedAt: new Date() } },
      { upsert: true }
    );

    const response = NextResponse.json({ message: 'Added to cart', carts, activeCartId }, { status: 200 });

    if (isNew) {
      response.cookies.set('guestCartId', sessionId, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    assertTrustedOrigin(request);

    const url = new URL(request.url);
    const productId = url.searchParams.get('id');

    if (!productId) {
      throw new AppError('Product ID is required.', 400);
    }

    // Validate that the ID is a valid number
    const pId = parseInt(productId, 10);
    if (isNaN(pId)) {
      throw new AppError('Product ID must be a valid number.', 400);
    }

    const { sessionId } = getCartSession(request);
    const db = await getDb();
    
    const cartCollection = db.collection('carts');
    
    // Only proceed if cart doc exists
    let cartDoc = await cartCollection.findOne({ sessionId });
    if (!cartDoc || !cartDoc.carts) {
      return NextResponse.json({ message: 'No cart found' }, { status: 200 });
    }

    const activeCartId = cartDoc.activeCartId;
    const targetCartIndex = cartDoc.carts.findIndex((c: any) => c.id === activeCartId);
    
    if (targetCartIndex > -1) {
      const items = cartDoc.carts[targetCartIndex].items || [];
      cartDoc.carts[targetCartIndex].items = items.filter((item: any) => Number(item.id) !== pId);

      await cartCollection.updateOne(
        { sessionId },
        { $set: { carts: cartDoc.carts, updatedAt: new Date() } }
      );
    }

    return NextResponse.json({ message: 'Item removed' }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    assertTrustedOrigin(request);

    const body = await request.json();
    const { action, cartId, name } = body;
    const { sessionId } = getCartSession(request);
    const db = await getDb();
    const cartCollection = db.collection('carts');
    
    let cartDoc: any = await cartCollection.findOne({ sessionId });
    if (!cartDoc) {
      cartDoc = {
        sessionId,
        activeCartId: "cart_1",
        carts: [{ id: "cart_1", name: "Cart No.1", items: [] }]
      };
    }

    if (action === "SWITCH_CART") {
      if (!cartId) throw new AppError("cartId is required", 400);
      
      const exists = cartDoc.carts.some((c: any) => c.id === cartId);
      if (!exists) throw new AppError("cartId not found", 404);

      await cartCollection.updateOne(
        { sessionId },
        { $set: { activeCartId: cartId, updatedAt: new Date() } }
      );
      return NextResponse.json({ message: 'Switched cart' });
    }

    if (action === "CREATE_CART") {
      if (!name) throw new AppError("name is required", 400);
      const newCartId = `cart_${Date.now()}`;
      cartDoc.carts.push({ id: newCartId, name, items: [] });
      await cartCollection.updateOne(
        { sessionId },
        { $set: { carts: cartDoc.carts, activeCartId: newCartId, updatedAt: new Date() } },
        { upsert: true }
      );
      return NextResponse.json({ message: 'Created cart', newCartId });
    }

    throw new AppError("Invalid action", 400);
  } catch (error) {
    return handleApiError(error);
  }
}