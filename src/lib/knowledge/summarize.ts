import "server-only";

import OpenAI from "openai";
import { KnowledgeSourceType } from "@prisma/client";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30_000,       // 30s for summarization (longer content)
  maxRetries: 1,
});

function fallbackSummary(input: { type: KnowledgeSourceType; text: string }) {
  const sample = input.text.slice(0, 1200);
  return {
    summaryText: `Summary for ${input.type.toLowerCase()} policy:\n${sample}`,
    structuredFacts: {
      confidence: 0.45,
      extractedFrom: input.type,
      note: "Generated without LLM fallback mode."
    }
  };
}

export async function generateKnowledgeSummary(input: {
  type: KnowledgeSourceType;
  url: string;
  text: string;
}): Promise<{ summaryText: string; structuredFacts: Record<string, unknown> }> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackSummary({ type: input.type, text: input.text });
  }

  const systemPrompt =
    "You summarize ecommerce policy pages for a sales assistant knowledge base. " +
    "Return strict JSON only — no markdown, no code fences. " +
    'Keys: "summaryText" (customer-safe short summary in plain English) and ' +
    '"structuredFacts" (object with keys: shippingWindow, returnWindow, supportChannels, exclusions, warranty, confidence). ' +
    "Do not add legal advice.";

  const userPrompt = [
    `Source type: ${input.type}`,
    `Source URL: ${input.url}`,
    "Source content:",
    input.text.slice(0, 12000)
  ].join("\n");

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    const parsed = JSON.parse(text) as {
      summaryText?: string;
      structuredFacts?: Record<string, unknown>;
    };

    if (parsed.summaryText && parsed.structuredFacts) {
      return {
        summaryText: parsed.summaryText.slice(0, 5000),
        structuredFacts: parsed.structuredFacts
      };
    }
  } catch (err) {
    console.error("[knowledge] AI summarization failed, using fallback:", err instanceof Error ? err.message : err);
  }

  return fallbackSummary({ type: input.type, text: input.text });
}
