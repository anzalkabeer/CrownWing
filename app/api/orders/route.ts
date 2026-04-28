import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createOrder, getUserOrders } from '@/lib/orders';
import { AppError, handleApiError } from '@/lib/api-error';
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

    const orders = await getUserOrders(decoded.userId);
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

    // Amount is formatted like "Rs. 18,999" -> parse it or rely on the totalAmount sent from frontend.
    // It's safer to re-calculate it or just use a parsed totalAmount.
    // Assuming totalAmount is a valid number representing the total in rupees.
    const numericAmount = typeof totalAmount === 'number' ? totalAmount : parseInt(String(totalAmount).replace(/[^0-9]/g, ''), 10);
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new AppError('Invalid total amount', 400);
    }

    // Razorpay amount is in smallest currency unit (paise)
    const amountInPaise = numericAmount * 100;

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
