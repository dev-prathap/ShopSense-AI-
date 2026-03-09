import "server-only";
import { upstashIncrWithExpiry } from "@/lib/security/upstash";

type Entry = {
  count: number;
  resetAt: number;
};

const bucket = new Map<string, Entry>();

function gc(now: number) {
  for (const [key, value] of bucket.entries()) {
    if (value.resetAt <= now) {
      bucket.delete(key);
    }
  }
}

export async function consumeRateLimit(input: { key: string; limit: number; windowMs: number }) {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const windowSeconds = Math.max(1, Math.ceil(input.windowMs / 1000));
      const count = await upstashIncrWithExpiry(input.key, windowSeconds);
      if (count > input.limit) {
        return { allowed: false, remaining: 0, resetAt: Date.now() + input.windowMs };
      }

      return {
        allowed: true,
        remaining: Math.max(0, input.limit - count),
        resetAt: Date.now() + input.windowMs
      };
    } catch {
      // fallback to in-memory for resilience when Upstash is unavailable
    }
  }

  const now = Date.now();
  gc(now);

  const current = bucket.get(input.key);
  if (!current || current.resetAt <= now) {
    const resetAt = now + input.windowMs;
    bucket.set(input.key, { count: 1, resetAt });
    return { allowed: true, remaining: input.limit - 1, resetAt };
  }

  if (current.count >= input.limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  bucket.set(input.key, current);
  return { allowed: true, remaining: input.limit - current.count, resetAt: current.resetAt };
}
