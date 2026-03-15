import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { fetchKnowledgeSources, summarizeKnowledgeSources, publishKnowledgeSources } from "@/lib/knowledge/service";

// This cron job should run daily to refresh knowledge sources
export async function GET(req: NextRequest) {
  // Simple auth check for cron
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Find sources that haven't been synced in > 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const staleSources = await prisma.knowledgeSource.findMany({
      where: {
        OR: [
          { lastFetchedAt: { lt: yesterday } },
          { lastFetchedAt: null },
          { status: "PENDING" }
        ],
        // Don't sync manual sources normally as they are local text
        NOT: { url: { startsWith: "manual://" } }
      },
      take: 20 // Process in small batches
    });

    if (staleSources.length === 0) {
      return NextResponse.json({ ok: true, message: "No stale sources found" });
    }

    const results = [];

    // Group by store for processing
    const storeIds = Array.from(new Set(staleSources.map(s => s.storeId)));

    for (const storeId of storeIds) {
      const storeSourceIds = staleSources
        .filter(s => s.storeId === storeId)
        .map(s => s.id);

      // Fetch
      const fetched = await fetchKnowledgeSources({
        storeId,
        sourceIds: storeSourceIds,
        force: false
      });

      // Summarize
      await summarizeKnowledgeSources({
        storeId,
        sourceIds: storeSourceIds
      });

      // Publish
      await publishKnowledgeSources({
        storeId,
        sourceIds: storeSourceIds
      });

      results.push({ storeId, sources: storeSourceIds.length });
    }

    return NextResponse.json({ ok: true, processed: results });
  } catch (error) {
    console.error("Knowledge cron failed", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "cron_failed" 
    }, { status: 500 });
  }
}
