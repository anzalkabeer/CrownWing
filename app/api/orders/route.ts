import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createOrder, getUserOrders } from '@/lib/orders';
import { AppError, handleApiError } from '@/lib/api-error';
import { collectionItems } from '@/lib/data';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

/**
 * GET: Fetch all past orders for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) throw new AppError('Unauthorized', 401);

    const decoded = verifyToken(token);
    if (!decoded) throw new AppError('Unauthorized', 401);

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
    const skip = parseInt(request.nextUrl.searchParams.get('skip') || '0', 10);

    const orders = await getUserOrders(decoded.userId, isNaN(limit) ? 20 : limit, isNaN(skip) ? 0 : skip);
    return NextResponse.json({ orders }, { status: 200 });

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST: Create a new order.
 * Expects { items, totalAmount } in the body.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) throw new AppError('Unauthorized', 401);

    const decoded = verifyToken(token);
    if (!decoded) throw new AppError('Unauthorized', 401);

    const body = await request.json();
    const { items, totalAmount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('Order must contain at least one item.', 400);
    }

    // Calculate authoritative serverTotal
    let computedTotal = 0;
    for (const item of items) {
      const dbProduct = collectionItems.find((p) => p.id === item.id);
      if (!dbProduct) throw new AppError(`Product with id ${item.id} not found`, 404);
      
      const priceStr = dbProduct.price.replace(/,/g, '').replace(/[^0-9.]/g, '');
      const price = parseFloat(priceStr);
      if (isNaN(price)) throw new AppError('Invalid product price in database', 500);
      
      computedTotal += price * item.quantity;
    }

    const numericAmount = computedTotal;
    
    if (!isFinite(numericAmount) || numericAmount <= 0) {
      throw new AppError('Invalid total amount', 400);
    }

    // Razorpay amount is in smallest currency unit (paise)
    const amountInPaise = Math.round(numericAmount * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const order = await createOrder({
      userId: decoded.userId,
      items,
      totalAmount: String(numericAmount),
      status: 'pending',
      razorpayOrderId: rzpOrder.id,
    });

    return NextResponse.json({ 
      message: 'Order initiated',
      order,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: rzpOrder.currency,
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
