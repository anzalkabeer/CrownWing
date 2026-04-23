import jwt from 'jsonwebtoken';

// In a real app, this should be in .env.local
const JWT_SECRET = process.env.JWT_SECRET || 'crownwing_super_secret_key_2026';

export interface TokenPayload {
  userId: string;
  email: string;
}

// Sign a new token valid for 7 days
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify and decode a token
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
