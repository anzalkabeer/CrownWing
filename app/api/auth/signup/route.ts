import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, saveUser, User, generateNextUserId } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { validateSignupInput } from '@/lib/validation';
import { AppError, handleApiError } from '@/lib/api-error';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    // Validate input (email format, password strength, name length)
    const validation = validateSignupInput({ name, email, password });
    if (!validation.valid) {
      throw new AppError(validation.error!, 400);
    }

    const trimmedEmail = (email as string).trim().toLowerCase();
    const trimmedName = (name as string).trim();

    // Check if user already exists
    const existingUser = await getUserByEmail(trimmedEmail);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate Special Primary Key (CW-26-XXXX)
    const userId = await generateNextUserId();

    // Create user object
    const newUser: User = {
      id: userId,
      name: trimmedName,
      email: trimmedEmail,
      phone: phone,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    // Save to database
    await saveUser(newUser);

    // Generate JWT
    const token = signToken({ userId: newUser.id, email: newUser.email });

    // Return response with HttpOnly cookie
    const response = NextResponse.json(
      { 
        message: 'User created successfully',
        user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone }
      },
      { status: 201 }
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
