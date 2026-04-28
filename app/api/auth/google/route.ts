import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { getUserByEmail, saveUser, User, generateNextUserId } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { handleApiError, AppError } from '@/lib/api-error';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      throw new AppError('Missing Google credential', 400);
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError('Invalid Google credential payload', 401);
    }

    const { email, name } = payload;
    const trimmedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await getUserByEmail(trimmedEmail);

    if (!user) {
      // Create new user for Google Sign-In
      const userId = await generateNextUserId();
      
      const newUser: User = {
        id: userId,
        name: name || email.split('@')[0],
        email: trimmedEmail,
        // Since Google manages the password, we don't store one, 
        // or we store a dummy one to satisfy the DB schema (if required).
        // For security, an impossibly-to-match hash is good practice.
        passwordHash: 'GOOGLE_AUTH', 
        createdAt: new Date().toISOString(),
      };

      await saveUser(newUser);
      user = newUser;
    }

    // Generate our application JWT
    const token = signToken({ userId: user.id, email: user.email });

    // Return response with HttpOnly cookie
    const response = NextResponse.json(
      { 
        message: 'Google authentication successful',
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
