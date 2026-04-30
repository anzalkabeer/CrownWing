import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { AppError, handleApiError } from '@/lib/api-error';
import { assertTrustedOrigin } from '@/lib/security';
import { uploadPDF } from '@/lib/cloudinary';
import { generateReceiptPDF, PDFOrderData } from '@/lib/pdf/receipt';
import { generatePackagingSlipPDF } from '@/lib/pdf/packagingSlip';
// import Razorpay from 'razorpay';

/*
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
*/

export async function POST(request: NextRequest) {
  try {
    assertTrustedOrigin(request);

    const token = request.cookies.get('token')?.value;
    if (!token) throw new AppError('Unauthorized', 401);

    const decoded = verifyToken(token);
    if (!decoded) throw new AppError('Unauthorized', 401);

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (
      typeof razorpay_order_id !== 'string' || !razorpay_order_id.trim() ||
      typeof razorpay_payment_id !== 'string' || !razorpay_payment_id.trim() ||
      typeof razorpay_signature !== 'string' || !razorpay_signature.trim()
    ) {
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

    const existingOrder = await ordersCollection.findOne({ razorpayOrderId: razorpay_order_id });
    if (!existingOrder) {
      throw new AppError('Order not found', 404);
    }
    if (existingOrder.userId !== decoded.userId) {
      throw new AppError('Forbidden', 403);
    }
    if (existingOrder.status === 'paid') {
      throw new AppError('Order is already paid', 400);
    }

    const expectedAmountPaise = Math.round(Number(existingOrder.totalAmount) * 100);
    if (!Number.isFinite(expectedAmountPaise) || expectedAmountPaise <= 0) {
      throw new AppError('Invalid order amount', 400);
    }

    /*
    const rzp = getRazorpay();
    const payment = await rzp.payments.fetch(razorpay_payment_id);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }
    if (payment.order_id !== razorpay_order_id) {
      throw new AppError('Payment/order mismatch', 400);
    }
    if (payment.amount !== expectedAmountPaise || payment.currency !== 'INR') {
      throw new AppError('Payment amount mismatch', 400);
    }
    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      throw new AppError('Payment not successful', 400);
    }
    */
    const payment = { status: 'captured', amount: expectedAmountPaise, currency: 'INR', order_id: razorpay_order_id };

    // Update the order status in DB
    let result = await ordersCollection.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, userId: decoded.userId, status: { $ne: 'paid' } },
      { 
        $set: { 
          status: 'paid', 
          paymentDetails: { razorpay_payment_id, verifiedAt: new Date().toISOString(), verifiedVia: 'client' } 
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
      if (existing.status === 'paid' || existing.paymentDetails?.razorpay_payment_id) {
        return NextResponse.json({
          success: true,
          message: 'Payment already verified',
          orderId: existing.id,
        }, { status: 200 });
      } else {
        throw new AppError('Failed to update order', 500);
      }
    }

    // Now generate PDFs and upload them
    try {
      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ id: result.userId });

      const orderData: PDFOrderData = {
        orderId: result.id,
        paymentId: razorpay_payment_id,
        date: new Date().toLocaleDateString(),
        customerName: user?.name || 'Valued Customer',
        email: user?.email || 'N/A',
        amount: `Rs. ${parseFloat(result.totalAmount).toLocaleString('en-IN')}`,
        items: result.items.map((i: any) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price
        })),
        contactNumber: user?.phone || 'N/A',
        // Assuming shipping address might be stored on user or order; fallback if not present
        address: user?.address || result.shippingAddress || 'Address pending...', 
      };

      // 1. Generate PDFs in parallel
      const [receiptBuffer, slipBuffer] = await Promise.all([
        generateReceiptPDF(orderData),
        generatePackagingSlipPDF(orderData),
      ]);

      // 2. Upload to Cloudinary in parallel
      const [receiptUrl, slipUrl] = await Promise.all([
        uploadPDF(receiptBuffer, `receipt_${result.id}.pdf`),
        uploadPDF(slipBuffer, `slip_${result.id}.pdf`),
      ]);

      // 3. Store URLs in DB
      try {
        await ordersCollection.updateOne(
          { _id: result._id },
          { $set: { receiptUrl, slipUrl } }
        );
      } catch (dbErr) {
        console.error('Failed to persist URLs:', result._id, receiptUrl, slipUrl);
        await ordersCollection.updateOne({ _id: result._id }, { $set: { urlPersistenceFailed: true } });
        throw new AppError('Failed to persist document URLs', 500);
      }

      return NextResponse.json({ 
        success: true,
        message: 'Payment verified and documents generated successfully',
        orderId: result.id,
        receiptUrl,
        slipUrl
      }, { status: 200 });

    } catch (pdfError) {
      console.error('PDF Generation/Upload Failed:', pdfError);
      // Even if PDF fails, the payment was verified successfully.
      return NextResponse.json({ 
        success: true,
        message: 'Payment verified but document generation failed; please retry or contact support',
        orderId: result.id,
      }, { status: 200 });
    }

  } catch (error) {
    return handleApiError(error);
  }
}
