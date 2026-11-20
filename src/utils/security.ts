/**
 * Strix QR — Production Security & Safety Utilities
 * Handles URL sanitization, SSRF/private IP blocking, and API rate limiting.
 */

// Private & Link-local IPv4 / IPv6 ranges and sensitive internal hosts to block (SSRF protection)
const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^0\.0\.0\.0$/,
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/,
  /^169\.254\.\d{1,3}\.\d{1,3}$/, // Cloud metadata (AWS, GCP, Azure)
  /^metadata\.google\.internal$/i,
  /^\[?::1\]?$/,
  /^\[?fe80:/i,
  /^\[?fc00:/i,
];

export interface URLSafetyResult {
  safe: boolean;
  normalizedUrl?: string;
  reason?: string;
}

/**
 * Validates that a user-provided destination URL is safe for dynamic redirection.
 * Protects against open redirects to dangerous schemes (javascript:, data:) and SSRF.
 */
export function validateRedirectUrl(inputUrl: string): URLSafetyResult {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { safe: false, reason: 'URL cannot be empty' };
  }

  const trimmed = inputUrl.trim();

  // 1. Must use http or https protocol
  if (!/^https?:\/\//i.test(trimmed)) {
    return {
      safe: false,
      reason: 'URL must start with http:// or https://',
    };
  }

  try {
    const parsed = new URL(trimmed);

    // 2. Reject non-http(s) protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        safe: false,
        reason: `Unsupported protocol ${parsed.protocol}. Only http and https are allowed.`,
      };
    }

    // 3. Reject credentials in URL (e.g. https://user:pass@host)
    if (parsed.username || parsed.password) {
      return {
        safe: false,
        reason: 'Embedded user credentials are not permitted in redirect URLs.',
      };
    }

    // 4. Reject private / loopback / internal cloud metadata hosts
    const hostname = parsed.hostname.toLowerCase();
    for (const pattern of BLOCKED_HOST_PATTERNS) {
      if (pattern.test(hostname)) {
        return {
          safe: false,
          reason: 'Internal, private, or loopback network destinations are blocked for security.',
        };
      }
    }

    return {
      safe: true,
      normalizedUrl: parsed.toString(),
    };
  } catch {
    return { safe: false, reason: 'Malformed URL structure' };
  }
}

/**
 * In-memory sliding window rate limiter for API endpoints.
 * In a distributed multi-instance deployment, replace with Upstash Redis.
 */
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

export interface RateLimitOptions {
  limit: number;      // Maximum requests allowed within window
  windowSeconds: number; // Window duration in seconds
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 60, windowSeconds: 60 }
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const key = `${identifier}:${options.windowSeconds}`;

  let bucket = rateLimitStore.get(key);

  if (!bucket) {
    bucket = { tokens: options.limit - 1, lastRefill: now };
    rateLimitStore.set(key, bucket);
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetInSeconds: options.windowSeconds,
    };
  }

  const elapsed = now - bucket.lastRefill;
  if (elapsed > windowMs) {
    bucket.tokens = options.limit - 1;
    bucket.lastRefill = now;
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetInSeconds: options.windowSeconds,
    };
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    const remainingTime = Math.ceil((windowMs - elapsed) / 1000);
    return {
      allowed: true,
      remaining: bucket.tokens,
      resetInSeconds: remainingTime,
    };
  }

  const resetInSeconds = Math.ceil((windowMs - elapsed) / 1000);
  return {
    allowed: false,
    remaining: 0,
    resetInSeconds,
  };
}

/**
 * Clean & sanitize text strings (prevent XSS in user titles & labels)
 */
export function sanitizeText(text: string, maxLength = 255): string {
  if (!text) return '';
  return text
    .replace(/[<>'"&]/g, '') // remove HTML tag markers
    .slice(0, maxLength)
    .trim();
}
