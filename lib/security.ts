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

  const originHeader = request.headers.get('origin');
  const requestOrigin = request.nextUrl.origin;

  if (!originHeader) {
    throw new AppError('Forbidden: Missing origin header', 403);
  }

  const normalizedOrigin = normalizeOrigin(originHeader);
  if (!normalizedOrigin) {
    throw new AppError('Forbidden: Invalid origin header', 403);
  }

  const configuredOrigins = (process.env.CSRF_TRUSTED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => normalizeOrigin(value))
    .filter((value): value is string => Boolean(value));

  const allowedOrigins = new Set<string>([requestOrigin, ...configuredOrigins]);
  if (!allowedOrigins.has(normalizedOrigin)) {
    throw new AppError('Forbidden: CSRF validation failed', 403);
  }
}
