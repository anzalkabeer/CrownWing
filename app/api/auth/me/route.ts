import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserById } from '@/lib/db';
import { AppError, handleApiError } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    // Read the token from cookies
    const tokenCookie = request.cookies.get('token');
    
    // Check Authorization header fallback (in case they prefer passing it manually)
    const authHeader = request.headers.get('Authorization');
    let token = tokenCookie?.value;

    if (!token && authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      throw new AppError('Unauthorized: No token provided', 401);
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new AppError('Unauthorized: Invalid or expired token', 401);
    }

    // Fetch fresh user data
    const user = await getUserById(decoded.userId);
    if (!user) {
      throw new AppError('Unauthorized: User no longer exists', 401);
    }

    // Return safe user object (excluding password hash)
    return NextResponse.json(
      {
        user: {
          id: user.id!, 
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    );

  } catch (error) {
    return handleApiError(error);
  }
}
