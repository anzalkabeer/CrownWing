import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
}

// Lazy accessor — only throws when you actually try to sign/verify
function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "Missing JWT_SECRET environment variable. Set it in your .env.local file."
    );
  }
  return secret;
}

// Sign a new token valid for 7 days
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

// Verify and decode a token
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getSecret()) as TokenPayload;
  } catch (error) {
    return null;
  }
}
