import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserOrders } from '@/lib/orders';
import { AppError, handleApiError } from '@/lib/api-error';

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


