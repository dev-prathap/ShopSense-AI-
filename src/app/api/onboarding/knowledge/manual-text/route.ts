import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { upsertManualTextSource, summarizeKnowledgeSources, publishKnowledgeSources } from "@/lib/knowledge/service";

const schema = z.object({
  storeId: z.string().min(1),
  title: z.string().min(3).max(50),
  content: z.string().min(20).max(5000)
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = schema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { storeId, title, content } = parsed.data;

    // 1. Create the source
    const source = await upsertManualTextSource({ storeId, title, content });

    // 2. Automatically kick off the rest of the flow for THIS source
    // We already set status to FETCHED in upsertManualTextSource.
    
    await summarizeKnowledgeSources({
      storeId,
      sourceIds: [source.id],
      force: true
    });

    await publishKnowledgeSources({
      storeId,
      sourceIds: [source.id],
      force: true
    });

    return NextResponse.json({ success: true, sourceId: source.id });
  } catch (error) {
    console.error("Manual text knowledge failed", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "failed_to_process_text" 
    }, { status: 500 });
  }
}
