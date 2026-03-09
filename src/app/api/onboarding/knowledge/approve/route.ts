import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAppStoreMembership } from "@/lib/auth/app-api";
import { approveKnowledgeSources } from "@/lib/knowledge/service";

const schema = z.object({
  storeId: z.string().min(1),
  sourceIds: z.array(z.string().min(1)).optional()
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const auth = await requireAppStoreMembership(req, parsed.data.storeId);
  if (!auth.ok) {
    return auth.response;
  }

  const out = await approveKnowledgeSources({
    storeId: parsed.data.storeId,
    sourceIds: parsed.data.sourceIds
  });
  return NextResponse.json({ ok: true, ready: out.ready, sources: out.sources });
}
