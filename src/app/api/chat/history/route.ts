import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyWidgetAccess } from "@/lib/security/guards";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const conversationId = searchParams.get("conversationId");
  const visitorId = searchParams.get("visitorId");
  const before = searchParams.get("before");
  const limitRaw = Number(searchParams.get("limit") || 20);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20;

  if (!storeId || !conversationId || !visitorId) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  const auth = verifyWidgetAccess(req, { storeId, visitorId });
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 });
  }

  const beforeDate = before ? new Date(before) : null;
  const whereClause: any = {
    conversationId,
    conversation: {
      storeId,
      visitorId
    }
  };
  if (beforeDate && !Number.isNaN(beforeDate.getTime())) {
    whereClause.createdAt = { lt: beforeDate };
  }

  // Query newest-first for efficient cursor paging, then reverse for UI display.
  const rows = await prisma.message.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc"
    },
    take: limit + 1
  });
  const hasMore = rows.length > limit;
  const sliced = hasMore ? rows.slice(0, limit) : rows;
  const messages = [...sliced].reverse();
  const nextCursor = hasMore ? messages[0]?.createdAt.toISOString() : null;

  return NextResponse.json({
    messages: messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.createdAt
    })),
    hasMore,
    nextCursor
  });
}
