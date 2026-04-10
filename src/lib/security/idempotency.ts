import "server-only";
import { upstashSetNxWithExpiry } from "@/lib/security/upstash";

const used = new Map<string, number>();
const TTL_MS = 10 * 60 * 1000;

function cleanup(now: number) {
  for (const [key, exp] of used.entries()) {
    if (exp <= now) {
      used.delete(key);
    }
  }
}

export async function reserveIdempotencyKey(namespace: string, key: string | null): Promise<{ ok: boolean; reason?: string }> {
  if (!key) {
    return { ok: false, reason: "missing_idempotency_key" };
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const created = await upstashSetNxWithExpiry(`${namespace}:${key}`, "1", Math.ceil(TTL_MS / 1000));
      return created ? { ok: true } : { ok: false, reason: "duplicate_request" };
    } catch (err) {
      console.warn("[idempotency] Upstash unavailable, falling back to in-memory:", err instanceof Error ? err.message : err);
    }
  }

  const now = Date.now();
  cleanup(now);

  const token = `${namespace}:${key}`;
  if (used.has(token)) {
    return { ok: false, reason: "duplicate_request" };
  }

  used.set(token, now + TTL_MS);
  return { ok: true };
}
