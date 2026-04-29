import { NextRequest } from 'next/server';
import { AppError } from '@/lib/api-error';

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function assertTrustedOrigin(request: NextRequest) {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return;

  let originHeader = request.headers.get('origin');

  if (!originHeader) {
    const referer = request.headers.get('referer') || request.headers.get('referrer');
    if (referer) {
      originHeader = normalizeOrigin(referer);
    }
  }

  if (!originHeader) {
    throw new AppError('Forbidden: Missing origin header', 403);
  }

  const normalizedOrigin = normalizeOrigin(originHeader);
  if (!normalizedOrigin) {
    throw new AppError('Forbidden: Invalid origin header', 403);
  }

  const trustedOriginRaw = process.env.TRUSTED_ORIGIN || process.env.NEXTAUTH_URL;
  if (!trustedOriginRaw) {
    throw new AppError('Server configuration error: TRUSTED_ORIGIN is not defined', 500);
  }
  
  const trustedOrigin = normalizeOrigin(trustedOriginRaw);
  if (!trustedOrigin) {
    throw new AppError('Server configuration error: TRUSTED_ORIGIN is invalid', 500);
  }

  const configuredOrigins = (process.env.CSRF_TRUSTED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => normalizeOrigin(value))
    .filter((value): value is string => Boolean(value));

  const allowedOrigins = new Set<string>([trustedOrigin, ...configuredOrigins]);
  if (!allowedOrigins.has(normalizedOrigin)) {
    throw new AppError('Forbidden: CSRF validation failed', 403);
  }
}
