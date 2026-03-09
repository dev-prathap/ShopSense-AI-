import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAppStoreMembership } from "@/lib/auth/app-api";
import { upsertKnowledgeSources } from "@/lib/knowledge/service";

const schema = z.object({
  storeId: z.string().min(1),
  sources: z.array(
    z.object({
      type: z.enum(["PRIVACY", "SHIPPING", "RETURNS", "FAQ", "CONTACT", "CUSTOM"]),
      url: z.string().trim().url()
    })
  )
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

  const out = await upsertKnowledgeSources({
    storeId: parsed.data.storeId,
    sources: parsed.data.sources
  });
  return NextResponse.json({
    ok: true,
    ready: out.ready,
    sources: out.sources
  });
}
