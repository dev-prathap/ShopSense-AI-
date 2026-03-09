import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAppStoreMembership } from "@/lib/auth/app-api";
import { discoverKnowledgeSources } from "@/lib/knowledge/discovery";
import { upsertKnowledgeSources } from "@/lib/knowledge/service";

const schema = z.object({
  storeId: z.string().min(1),
  rootUrl: z.string().url()
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { storeId, rootUrl } = parsed.data;

  const auth = await requireAppStoreMembership(req, storeId);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const discovered = await discoverKnowledgeSources(rootUrl);
    
    // Auto-save discovered sources
    const result = await upsertKnowledgeSources({
      storeId,
      sources: discovered
    });

    return NextResponse.json({
      ok: true,
      discovered,
      sources: result.sources,
      ready: result.ready
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "discovery_failed"
    }, { status: 500 });
  }
}
