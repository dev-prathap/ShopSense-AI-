import "server-only";

import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function createEmbedding(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const safeText = text.slice(0, 8000);
  const result = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: safeText
  });

  return result.data[0]?.embedding || null;
}

export function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
