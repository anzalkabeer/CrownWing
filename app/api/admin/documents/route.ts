import { NextResponse, NextRequest } from 'next/server';
import { verifyToken, isAdmin } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { AppError, handleApiError } from '@/lib/api-error';

/**
 * Utility to inject Cloudinary attachment flag to force file download
 */
function makeDownloadableUrl(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace('/upload/', '/upload/fl_attachment/');
}

/**
 * GET: Fetch all generated PDF documents securely from the backend.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) throw new AppError('Unauthorized', 401);

    const decoded = verifyToken(token);
    if (!decoded) throw new AppError('Unauthorized', 401);

    // Strict Admin Authorization Check
    if (!isAdmin(decoded.email)) {
      throw new AppError('Forbidden: Admin access required', 403);
    }

    const db = await getDb();
    
    // Only fetch orders that actually have generated documents
    const ordersWithDocs = await db.collection('orders')
      .find({
        $or: [
          { receiptUrl: { $exists: true, $ne: null } },
          { slipUrl: { $exists: true, $ne: null } }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    // The BACKEND processes and isolates the documents, returning a clean array
    const documents: Array<{ type: string, url: string, orderId: string, date: string }> = [];

    for (const order of ordersWithDocs) {
      if (order.receiptUrl) {
        documents.push({
          type: "Receipt",
          url: makeDownloadableUrl(order.receiptUrl) as string,
          orderId: order.id,
          date: order.createdAt
        });
      }
      if (order.slipUrl) {
        documents.push({
          type: "Packaging Slip",
          url: makeDownloadableUrl(order.slipUrl) as string,
          orderId: order.id,
          date: order.createdAt
        });
      }
    }

    return NextResponse.json({ documents }, { status: 200 });

  } catch (error) {
    return handleApiError(error);
  }
}
