import { prisma } from "@/lib/db/prisma";
import { createEmbedding } from "@/lib/ai/embeddings";
import { queryKnowledgeSimilarity, queryProductSimilarity } from "@/lib/db/vector";

interface RetrievedProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  inStock: boolean;
  similarity: number;
}

export interface RetrievedKnowledge {
  sourceId: string;
  sourceType: string;
  sourceUrl: string;
  summaryText: string | null;
  content: string;
  similarity: number;
}

function extractKeywords(message: string): string[] {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3)
    .slice(0, 8);
}

function keywordScore(input: { text: string; tags: string[]; keywords: string[] }): number {
  const haystack = `${input.text} ${input.tags.join(" ")}`.toLowerCase();
  let score = 0;
  for (const keyword of input.keywords) {
    if (haystack.includes(keyword)) {
      score += 0.08;
    }
  }

  return Math.min(0.35, score);
}

function parseBudget(message: string): number | null {
  const match = message.match(/under\s*\$?(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : null;
}

export async function retrieveProductsForQuery(storeId: string, message: string): Promise<RetrievedProduct[]> {
  const budget = parseBudget(message);
  const keywords = extractKeywords(message);

  if (process.env.OPENAI_API_KEY) {
    try {
      const embedding = await createEmbedding(message);
      if (embedding) {
        const vectorRows = await queryProductSimilarity({
          storeId,
          embedding,
          budget,
          limit: 12
        });

        if (vectorRows.length > 0) {
          return vectorRows
            .map((item) => {
              const baseSimilarity = Number(item.similarity);
              const text = `${item.title} ${item.description}`;
              const boosted = Math.min(
                0.99,
                baseSimilarity + keywordScore({ text, tags: [], keywords }) + (budget && Number(item.price) <= budget ? 0.04 : 0)
              );

              return {
                id: item.id,
                title: item.title,
                description: item.description,
                price: Number(item.price),
                currency: item.currency,
                inStock: item.inStock,
                similarity: boosted
              };
            })
            .sort((a, b) => b.similarity - a.similarity);
        }
      }
    } catch {
      // Falls back to metadata query for resilience when embedding/vector path fails.
    }
  }

  const items = await prisma.product.findMany({
    where: {
      storeId,
      inStock: true,
      ...(budget ? { price: { lte: budget } } : {})
    },
    take: 12,
    orderBy: {
      updatedAt: "desc"
    }
  });

  return items.map((item, index) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    price: Number(item.price),
    currency: item.currency,
    inStock: item.inStock,
    similarity: Math.min(
      0.99,
      Math.max(0.5, 0.95 - index * 0.05) +
        keywordScore({ text: `${item.title} ${item.description}`, tags: item.tags, keywords }) +
        (budget && Number(item.price) <= budget ? 0.04 : 0)
    )
  })).sort((a, b) => b.similarity - a.similarity);
}

export async function retrieveKnowledgeForQuery(storeId: string, message: string): Promise<RetrievedKnowledge[]> {
  if (!process.env.OPENAI_API_KEY) {
    return [];
  }

  try {
    const embedding = await createEmbedding(message);
    if (!embedding) {
      return [];
    }

    const rows = await queryKnowledgeSimilarity({
      storeId,
      embedding,
      limit: 6
    });
    return rows.map((row) => ({
      sourceId: row.sourceId,
      sourceType: row.sourceType,
      sourceUrl: row.sourceUrl,
      summaryText: row.summaryText,
      content: row.content,
      similarity: Number(row.similarity)
    }));
  } catch {
    return [];
  }
}
