import "server-only";

import OpenAI from "openai";
import { KnowledgeSourceType } from "@prisma/client";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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

  const prompt = [
    "You summarize ecommerce policy pages for a sales assistant knowledge base.",
    `Source type: ${input.type}`,
    `Source URL: ${input.url}`,
    "Return strict JSON with keys:",
    "- summaryText: customer-safe short summary in plain English.",
    "- structuredFacts: object with keys shippingWindow, returnWindow, supportChannels, exclusions, warranty, confidence.",
    "Do not add legal advice.",
    "Source content:",
    input.text.slice(0, 12000)
  ].join("\n");

  const completion = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    temperature: 0.2
  });

  const text = completion.output_text?.trim() || "";
  try {
    const parsed = JSON.parse(text) as { summaryText?: string; structuredFacts?: Record<string, unknown> };
    if (parsed.summaryText && parsed.structuredFacts) {
      return {
        summaryText: parsed.summaryText.slice(0, 5000),
        structuredFacts: parsed.structuredFacts
      };
    }
  } catch {
    // fallback below
  }

  return fallbackSummary({ type: input.type, text: input.text });
}
