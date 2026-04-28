/**
 * In-memory sliding-window rate limiter for CrownWing.
 *
 * Suitable for single-instance / dev deployments.
 * For multi-instance production, swap to Redis-backed storage
 * (e.g., @upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number;
  resetTime: number; // Unix timestamp (ms)
}

// Global store — persists across requests within the same process.
const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 60 seconds to prevent memory leaks.
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number; // Unix timestamp (ms)
}

/**
 * Check and consume a rate limit token for the given key.
 *
 * @param key      Unique identifier (e.g., IP address)
 * @param limit    Max requests allowed within the window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  cleanupExpired();

  const now = Date.now();
  const entry = store.get(key);

  // First request or window expired — start a fresh window.
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    store.set(key, { count: 1, resetTime });
    return { success: true, remaining: limit - 1, resetTime };
  }

  // Within the current window.
  if (entry.count < limit) {
    entry.count++;
    return { success: true, remaining: limit - entry.count, resetTime: entry.resetTime };
  }

  // Limit exceeded.
  return { success: false, remaining: 0, resetTime: entry.resetTime };
}
