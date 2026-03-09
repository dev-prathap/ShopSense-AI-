import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyWidgetAccess } from "@/lib/security/guards";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const conversationId = searchParams.get("conversationId");
  const visitorId = searchParams.get("visitorId");

  if (!storeId || !conversationId || !visitorId) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  const auth = verifyWidgetAccess(req, { storeId, visitorId });
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      conversation: {
        storeId,
        visitorId
      }
    },
    orderBy: {
      createdAt: "asc"
    },
    take: 50
  });

  return NextResponse.json({
    messages: messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.createdAt
    }))
  });
}
