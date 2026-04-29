import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createOrder } from '@/lib/orders';
import { AppError, handleApiError } from '@/lib/api-error';
import { collectionItems } from '@/lib/data';
import { assertTrustedOrigin } from '@/lib/security';
import Razorpay from 'razorpay';

let razorpay: any = null;

function getRazorpay() {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new AppError('Server configuration error: missing Razorpay credentials', 500);
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

export async function POST(request: NextRequest) {
  try {
    assertTrustedOrigin(request);

    const token = request.cookies.get('token')?.value;
    if (!token) throw new AppError('Unauthorized', 401);

    const decoded = verifyToken(token);
    if (!decoded) throw new AppError('Unauthorized', 401);

    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('Order must contain at least one item.', 400);
    }

    // Calculate authoritative serverTotal
    let computedTotal = 0;
    const normalizedItems: Array<{
      id: number;
      name: string;
      price: string;
      image: string;
      quantity: number;
    }> = [];

    for (const item of items) {
      const productId = Number(item?.id);
      const quantity = Number(item?.quantity);

      if (!Number.isInteger(productId) || productId <= 0) {
        throw new AppError('Invalid product id in order payload', 400);
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        throw new AppError('Quantity must be an integer between 1 and 20', 400);
      }

      const dbProduct = collectionItems.find((p) => p.id === productId);
      if (!dbProduct) throw new AppError(`Product with id ${productId} not found`, 404);
      
      const priceStr = dbProduct.price.replace(/,/g, '').replace(/[^0-9.]/g, '');
      const paisePrice = Math.round(parseFloat(priceStr) * 100);
      if (isNaN(paisePrice) || paisePrice <= 0) throw new AppError('Invalid product price in database', 500);
      
      computedTotal += paisePrice * quantity;
      normalizedItems.push({
        id: dbProduct.id,
        name: dbProduct.name,
        price: dbProduct.price,
        image: dbProduct.image,
        quantity,
      });
    }

    const numericAmount = computedTotal / 100;
    
    if (!isFinite(numericAmount) || numericAmount <= 0) {
      throw new AppError('Invalid total amount', 400);
    }

    // Razorpay amount is in smallest currency unit (paise)
    const amountInPaise = computedTotal;
    
    const rzpClient = getRazorpay();
    const rzpOrder = await rzpClient.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const order = await createOrder({
      userId: decoded.userId,
      items: normalizedItems,
      totalAmount: String(numericAmount),
      status: 'pending',
      razorpayOrderId: rzpOrder.id,
    });

    return NextResponse.json({ 
      orderId: rzpOrder.id,
      amount: amountInPaise,
      currency: rzpOrder.currency,
      dbOrderId: order.id
    }, { status: 200 });

  } catch (error) {
    return handleApiError(error);
  }
}
