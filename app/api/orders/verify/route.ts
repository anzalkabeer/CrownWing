import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/mongodb';
import { AppError, handleApiError } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError('Missing payment verification details', 400);
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new AppError('Server configuration error: missing Razorpay secret', 500);
    }
    
    // Create the expected signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const signatureBuffer = Buffer.from(razorpay_signature, 'hex');

    if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      throw new AppError('Invalid payment signature', 400);
    }

    // Signature matches, payment is legit!
    const db = await getDb();
    const ordersCollection = db.collection('orders');

    // Update the order status in DB
    const result = await ordersCollection.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, status: { $ne: 'paid' } },
      { 
        $set: { 
          status: 'paid', 
          paymentDetails: { razorpay_payment_id, razorpay_signature, verifiedAt: new Date().toISOString() } 
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      // It might be already paid or not found
      const existing = await ordersCollection.findOne({ razorpayOrderId: razorpay_order_id });
      if (!existing) {
        throw new AppError('Order not found', 404);
      }
      if (existing.status === 'paid') {
        throw new AppError('Order is already paid', 400);
      }
      throw new AppError('Failed to update order', 500);
    }

    return NextResponse.json({ 
      message: 'Payment verified successfully',
      order: result
    }, { status: 200 });

  } catch (error) {
    return handleApiError(error);
  }
}
