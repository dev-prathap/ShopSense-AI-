import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { enforceAdminRole } from "@/lib/security/admin-api";
import { prisma } from "@/lib/db/prisma";

const querySchema = z.object({
  storeId: z.string().min(1),
  status: z.enum(["OPEN", "HANDOFF_REQUESTED", "RESOLVED"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional() // Cursor for pagination
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { storeId, status, limit, cursor } = parsed.data;
  const unauthorized = await enforceAdminRole(req, {
    storeId,
    minimumRole: UserRole.STAFF
  });
  if (unauthorized) {
    return unauthorized;
  }

  const pageSize = limit || 30;

  const rows = await prisma.conversation.findMany({
    where: {
      storeId,
      ...(status ? { status } : {}),
      ...(cursor ? {
        updatedAt: {
          lt: new Date(cursor)
        }
      } : {})
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { updatedAt: "desc" },
    take: pageSize + 1 // Fetch one extra to determine if there are more pages
  });

  // Separate data and next cursor
  const hasNextPage = rows.length > pageSize;
  const conversations = hasNextPage ? rows.slice(0, pageSize) : rows;
  const nextCursor = hasNextPage
    ? conversations[conversations.length - 1]?.updatedAt?.toISOString()
    : null;

  return NextResponse.json({
    conversations: conversations.map((row) => ({
      id: row.id,
      visitorId: row.visitorId,
      status: row.status,
      handoffReason: row.handoffReason,
      handoffNotifiedAt: row.handoffNotifiedAt,
      convertedAt: row.convertedAt,
      resolvedAt: row.resolvedAt,
      updatedAt: row.updatedAt,
      latestMessage: row.messages[0]?.content || null,
      latestMessageAt: row.messages[0]?.createdAt || null
    })),
    pagination: {
      hasNextPage,
      nextCursor,
      limit: pageSize
    }
  });
}
