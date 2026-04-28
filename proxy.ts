/**
 * Next.js 16 Proxy (replaces deprecated middleware.ts).
 *
 * Applies rate limiting to auth endpoints (login & signup)
 * to prevent brute-force and credential-stuffing attacks.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

// Rate limit configuration for auth endpoints.
const AUTH_RATE_LIMIT = 5;           // max requests
const AUTH_RATE_WINDOW_MS = 60_000;  // per 60 seconds

export function proxy(request: NextRequest) {
  // Extract client IP — x-forwarded-for in production, fallback for local dev.
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || '127.0.0.1';

  const { success, remaining, resetTime } = rateLimit(
    ip,
    AUTH_RATE_LIMIT,
    AUTH_RATE_WINDOW_MS
  );

  if (!success) {
    const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));

    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
          'X-RateLimit-Limit': String(AUTH_RATE_LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
        },
      }
    );
  }

  // Attach rate limit info headers for successful requests.
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(AUTH_RATE_LIMIT));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));

  return response;
}

// Only apply rate limiting to auth endpoints.
export const config = {
  matcher: ['/api/auth/login', '/api/auth/signup'],
};
