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

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    
    // Create the expected signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new AppError('Invalid payment signature', 400);
    }

    // Signature matches, payment is legit!
    const db = await getDb();
    const ordersCollection = db.collection('orders');

    // Update the order status in DB
    const result = await ordersCollection.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { 
        $set: { 
          status: 'paid', 
          paymentDetails: { razorpay_payment_id, razorpay_signature, verifiedAt: new Date().toISOString() } 
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('Order not found', 404);
    }

    return NextResponse.json({ 
      message: 'Payment verified successfully',
      order: result
    }, { status: 200 });

  } catch (error) {
    return handleApiError(error);
  }
}
