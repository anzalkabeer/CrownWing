import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, saveUser, User } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user object
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    // Save to database
    saveUser(newUser);

    // Generate JWT
    const token = signToken({ userId: newUser.id, email: newUser.email });

    // Return response with HttpOnly cookie
    const response = NextResponse.json(
      { 
        message: 'User created successfully',
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
