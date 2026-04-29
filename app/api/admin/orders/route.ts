import { NextResponse, NextRequest } from 'next/server';
import { verifyToken, isAdmin } from '@/lib/auth';
import { getUserById } from '@/lib/db';
import { getDb } from '@/lib/mongodb';
import { AppError, handleApiError } from '@/lib/api-error';

/**
 * Utility to inject Cloudinary attachment flag to force file download
 */
function makeDownloadableUrl(url: string | undefined): string | null {
  if (!url) return null;
  // Cloudinary standard upload URL format: https://res.cloudinary.com/.../upload/v123...
  return url.replace('/upload/', '/upload/fl_attachment/');
}

/**
 * GET: Fetch all past orders for the admin panel.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) throw new AppError('Unauthorized', 401);

    const decoded = verifyToken(token);
    if (!decoded) throw new AppError('Unauthorized', 401);

    // Authorize using current DB state rather than only token claim.
    const user = await getUserById(decoded.userId);
    if (!user || !isAdmin(user.email)) {
      throw new AppError('Forbidden: Admin access required', 403);
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10);
    const skip = parseInt(request.nextUrl.searchParams.get('skip') || '0', 10);
    
    const safeLimit = Math.min(Math.max(1, limit), 200);
    const safeSkip = Math.max(0, skip);

    const db = await getDb();
    const orders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .skip(safeSkip)
      .limit(safeLimit)
      .toArray();

    const totalOrders = await db.collection('orders').countDocuments();

    // Map the orders and securely format the downloadable URLs
    const formattedOrders = orders.map(o => ({
      id: o.id,
      userId: o.userId,
      items: o.items,
      totalAmount: o.totalAmount,
      status: o.status,
      razorpayOrderId: o.razorpayOrderId,
      createdAt: o.createdAt,
      // Map Cloudinary URLs to be instantly downloadable
      receiptUrl: makeDownloadableUrl(o.receiptUrl),
      packagingSlipUrl: makeDownloadableUrl(o.slipUrl),
    }));

    return NextResponse.json({ 
      orders: formattedOrders,
      pagination: {
        total: totalOrders,
        limit: safeLimit,
        skip: safeSkip
      }
    }, { status: 200 });

  } catch (error) {
    return handleApiError(error);
  }
}
