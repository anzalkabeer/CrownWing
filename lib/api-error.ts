/**
 * Structured error handling for CrownWing API routes.
 *
 * - AppError: throw for expected/known error conditions (bad input, not found, etc.)
 * - handleApiError: catch-all that logs internally but never leaks stack traces.
 */

import { NextResponse } from 'next/server';

/**
 * A known, expected application error with a specific HTTP status code.
 * Throw this inside route handlers for predictable error responses.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

/**
 * Generic safe error response builder.
 *
 * - If the error is an AppError, returns its message and status code.
 * - For everything else (DB failures, unexpected throws, etc.), logs the full
 *   error server-side and returns a generic message — never exposing internals.
 */
export function handleApiError(error: unknown) {
  // Known, expected error — safe to return its message.
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Unexpected error — log full details server-side only.
  console.error('[CrownWing API] Unexpected error:', error);

  return NextResponse.json(
    { error: 'Something went wrong. Please try again later.' },
    { status: 500 }
  );
}
