import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/mongodb';
import { AppError, handleApiError } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text(); // Webhook signature requires raw body string
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      throw new AppError('Missing webhook signature', 400);
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new AppError('Server configuration error: missing Razorpay webhook secret', 500);
    }

    // Verify webhook signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');

    if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      throw new AppError('Invalid webhook signature', 400);
    }

    // Parse the event payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    let eventId = payload?.id || payload?.payload?.payment?.entity?.id;
    if (!eventId) {
      console.warn('Webhook using fallback idempotency key', payload?.event);
      eventId = `${payload.event}:${payload.created_at || payload.created || 'unknown-created'}`;
    }
    
    const db = await getDb();
    const ordersCollection = db.collection('orders');
    const webhookEventsCollection = db.collection('webhookEvents');

    if (eventId) {
      const alreadyProcessed = await webhookEventsCollection.findOne({ eventId });
      if (alreadyProcessed) {
        return NextResponse.json({ status: 'ok' }, { status: 200 });
      }
    }

    // Handle supported events
    if (eventType === 'payment.captured') {
      const payment = payload?.payload?.payment?.entity;
      if (!payment || !payment.order_id) {
        console.warn('Missing payment entity or order_id in payment.captured webhook');
        return NextResponse.json({ status: 'ok' }, { status: 200 });
      }
      const razorpayOrderId = payment.order_id;
      
      // We only update if the order isn't already paid (e.g. from the client-side verification route)
      await ordersCollection.updateOne(
        { razorpayOrderId, status: { $ne: 'paid' } },
        { 
          $set: { 
            status: 'paid', 
            paymentDetails: { 
              razorpay_payment_id: payment.id, 
              verifiedVia: 'webhook',
              verifiedAt: new Date().toISOString() 
            } 
          } 
        }
      );
      
    } else if (eventType === 'payment.failed') {
      const payment = payload?.payload?.payment?.entity;
      if (!payment || !payment.order_id) {
        console.warn('Missing payment entity or order_id in payment.failed webhook');
        return NextResponse.json({ status: 'ok' }, { status: 200 });
      }
      const razorpayOrderId = payment.order_id;

      await ordersCollection.updateOne(
        { razorpayOrderId, status: { $ne: 'paid' } },
        { 
          $set: { 
            status: 'failed', 
            paymentDetails: { 
              error: payment.error_description,
              failedAt: new Date().toISOString() 
            } 
          } 
        }
      );
    }

    if (eventId) {
      await webhookEventsCollection.updateOne(
        { eventId },
        { $set: { processedAt: new Date().toISOString() } },
        { upsert: true }
      );
    }

    // Razorpay expects a 200 OK to acknowledge receipt
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    // If we throw 400/500, Razorpay will retry the webhook.
    // For validation errors, we might want to return 200 to prevent retries if it's permanently invalid.
    if (error instanceof AppError && error.statusCode === 400) {
      console.error('Webhook Validation Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 200 });
    }
    return handleApiError(error);
  }
}
