import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
}

const JWT_ISSUER = process.env.JWT_ISSUER || 'crownwing';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'crownwing-app';

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
  return jwt.sign(payload, getSecret(), {
    expiresIn: '7d',
    algorithm: 'HS256',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    subject: payload.userId,
  });
}

// Verify and decode a token
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getSecret(), {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as TokenPayload;
  } catch {
    return null;
  }
}

// Check if an email is an administrator
export function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS || '';
  if (!adminEmails) return false;
  
  const allowedEmails = adminEmails.split(',').map(e => e.trim().toLowerCase());
  return allowedEmails.includes(email.trim().toLowerCase());
}
