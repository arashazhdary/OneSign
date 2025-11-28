// Simple in-memory rate limiter
// In production, use Redis or a proper rate limiting service

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
}

export function rateLimit(config: RateLimitConfig) {
  return function checkRateLimit(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const record = store[identifier];

    // Clean up expired records
    if (record && now > record.resetTime) {
      delete store[identifier];
    }

    // Initialize or get existing record
    const currentRecord = store[identifier] || {
      count: 0,
      resetTime: now + config.windowMs,
    };

    // Check if limit exceeded
    if (currentRecord.count >= config.max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: currentRecord.resetTime,
      };
    }

    // Increment count
    currentRecord.count++;
    store[identifier] = currentRecord;

    return {
      allowed: true,
      remaining: config.max - currentRecord.count,
      resetTime: currentRecord.resetTime,
    };
  };
}

// Cleanup old records periodically
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 60000); // Clean up every minute
