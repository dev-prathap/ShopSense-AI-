import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAppStoreMembership } from "@/lib/auth/app-api";
import { listKnowledgeSources } from "@/lib/knowledge/service";

const schema = z.object({
  storeId: z.string().min(1)
});

export async function GET(req: NextRequest) {
  const parsed = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const auth = await requireAppStoreMembership(req, parsed.data.storeId);
  if (!auth.ok) {
    return auth.response;
  }

  const out = await listKnowledgeSources(parsed.data.storeId);
  return NextResponse.json({
    storeId: parsed.data.storeId,
    ready: out.ready,
    sources: out.sources
  });
}
