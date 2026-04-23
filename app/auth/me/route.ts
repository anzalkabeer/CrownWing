import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserById } from '@/lib/db';

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
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }

    // Fetch fresh user data
    const user = getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: User no longer exists' },
        { status: 401 }
      );
    }

    // Return safe user object (excluding password hash)
    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
