import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { validateLoginInput } from '@/lib/validation';
import { AppError, handleApiError } from '@/lib/api-error';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input (email format, password presence)
    const validation = validateLoginInput({ email, password });
    if (!validation.valid) {
      throw new AppError(validation.error!, 400);
    }

    const trimmedEmail = (email as string).trim().toLowerCase();

    // Find user
    const user = await getUserByEmail(trimmedEmail);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.authProvider && user.authProvider !== 'password') {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT
    const token = signToken({ userId: user.id, email: user.email });

    // Return response with HttpOnly cookie
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email }
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    return handleApiError(error);
  }
}
