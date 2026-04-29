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
const RATE_LIMITED_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/google',
  '/api/razorpay/create-order',
  '/api/razorpay/verify-payment',
  '/api/cart',
]);

function setSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
}

function isValidIp(value: string | null): value is string {
  if (!value) return false;
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(value) || value.includes(':');
}

function getClientIp(request: NextRequest): string {
  const realIp = request.headers.get('x-real-ip');
  if (isValidIp(realIp)) return realIp;

  const forwarded = request.headers.get('x-forwarded-for');
  const firstForwarded = forwarded?.split(',')[0]?.trim() || null;
  if (isValidIp(firstForwarded)) return firstForwarded;

  return 'unknown';
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();
  setSecurityHeaders(response);

  if (!RATE_LIMITED_PATHS.has(pathname)) {
    return response;
  }

  const ip = getClientIp(request);
  const { success, remaining, resetTime } = rateLimit(
    ip,
    AUTH_RATE_LIMIT,
    AUTH_RATE_WINDOW_MS
  );

  if (!success) {
    const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));

    const rateLimitedResponse = NextResponse.json(
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
    setSecurityHeaders(rateLimitedResponse);
    return rateLimitedResponse;
  }

  // Attach rate limit info headers for successful requests.
  response.headers.set('X-RateLimit-Limit', String(AUTH_RATE_LIMIT));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
