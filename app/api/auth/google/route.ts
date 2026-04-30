import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { getUserByEmail, saveUser, User } from '@/lib/db';
import { signToken, isAdmin } from '@/lib/auth';
import { handleApiError, AppError } from '@/lib/api-error';
import crypto from 'crypto';

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
    
    if (!payload.email_verified) {
      throw new AppError('Unverified Google email', 401);
    }

    const { email, name } = payload;
    const trimmedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await getUserByEmail(trimmedEmail);

    if (!user) {
      const newUser: User = {

        name: name || email.split('@')[0],
        email: trimmedEmail,
        passwordHash: crypto.randomBytes(32).toString('hex'), 
        authProvider: 'google',
        createdAt: new Date().toISOString(),
      };

      try {
        const userId = await saveUser(newUser);
        user = { ...newUser, id: userId };
      } catch (err: any) {
        if (err.code === 11000) {
          // Race condition occurred; someone else registered this email right now.
          const existingUser = await getUserByEmail(trimmedEmail);
          if (!existingUser) throw new AppError('Account creation conflict', 500);
          user = existingUser;
        } else {
          throw err;
        }
      }
    }

    // Generate our application JWT
    const token = signToken({ userId: user.id!, email: user.email });

    // Return response with HttpOnly cookie
    const response = NextResponse.json(
      { 
        message: 'Google authentication successful',
        user: { 
          id: user.id!, 
          name: user.name, 
          email: user.email,
          role: isAdmin(user.email) ? 'admin' : 'user'
        }
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
