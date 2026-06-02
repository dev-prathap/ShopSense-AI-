import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * Lightweight health check for uptime monitors (UptimeRobot, Vercel monitoring,
 * external probes). Returns 200 when the app can serve requests AND reach the
 * database, 503 otherwise. Intentionally does NOT check external services
 * (OpenAI, Shopify, Upstash) — those failures should not cascade into "app down".
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "healthy",
      db: "ok",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        db: "error",
        error: error instanceof Error ? error.message.slice(0, 200) : "unknown",
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
