import "server-only";

async function runPipeline(commands: string[][]): Promise<Array<{ result?: string | number | null; error?: string }>> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("upstash_not_configured");
  }

  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(commands)
  });

  if (!res.ok) {
    throw new Error(`upstash_http_${res.status}`);
  }

  const data = (await res.json()) as Array<{ result?: string | number | null; error?: string }>;
  return data;
}

export async function upstashIncrWithExpiry(key: string, windowSeconds: number): Promise<number> {
  const [incr, expire] = await runPipeline([
    ["INCR", key],
    ["EXPIRE", key, String(windowSeconds), "NX"]
  ]);

  if (incr?.error) {
    throw new Error(incr.error);
  }
  if (expire?.error) {
    throw new Error(expire.error);
  }

  return Number(incr?.result || 0);
}

export async function upstashSetNxWithExpiry(key: string, value: string, ttlSeconds: number): Promise<boolean> {
  const [set] = await runPipeline([["SET", key, value, "NX", "EX", String(ttlSeconds)]]);
  if (set?.error) {
    throw new Error(set.error);
  }

  return set?.result === "OK";
}
