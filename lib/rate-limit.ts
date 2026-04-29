/**
 * In-memory fixed-window rate limiter for CrownWing.
 * Note: this has edge-case burst behavior at window boundaries.
 * Suitable for single-instance / dev deployments.
 * For multi-instance production, swap to Redis-backed storage
 * (e.g., @upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number;
  resetTime: number; // Unix timestamp (ms)
}

// Global store — persists across requests within the same process.
// WARNING FOR VERCEL DEPLOYMENTS:
// Next.js serverless functions do NOT share memory. This Map will be isolated
// to a single lambda instance and will reset frequently. For production rate limiting,
// you MUST replace this Map with a Redis store (e.g., Upstash).
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
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error('limit must be a positive integer');
  }
  if (typeof windowMs !== 'number' || windowMs <= 0 || isNaN(windowMs)) {
    throw new Error('windowMs must be a positive number');
  }

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
