import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function upsertProductEmbedding(input: {
  id: string;
  storeId: string;
  productId: string;
  content: string;
  embedding: number[];
}) {
  const vectorLiteral = `[${input.embedding.join(",")}]`;

  await prisma.$executeRawUnsafe(
    `
    INSERT INTO "ProductEmbedding" ("id", "storeId", "productId", "content", "embedding", "createdAt")
    VALUES ($1, $2, $3, $4, $5::vector, NOW())
    ON CONFLICT ("productId") DO UPDATE SET
      "content" = EXCLUDED."content",
      "embedding" = EXCLUDED."embedding"
    `,
    input.id,
    input.storeId,
    input.productId,
    input.content,
    vectorLiteral
  );
}

export async function queryProductSimilarity(input: {
  storeId: string;
  embedding: number[];
  budget?: number | null;
  limit?: number;
}) {
  const vectorLiteral = `[${input.embedding.join(",")}]`;
  const limit = input.limit || 12;

  if (typeof input.budget === "number") {
    return prisma.$queryRawUnsafe<Array<{
      id: string;
      title: string;
      description: string;
      price: number;
      currency: string;
      inStock: boolean;
      similarity: number;
    }>>(
      `
      SELECT p."id", p."title", p."description", p."price", p."currency", p."inStock",
      (1 - (pe."embedding" <=> $1::vector)) AS similarity
      FROM "ProductEmbedding" pe
      JOIN "Product" p ON p."id" = pe."productId"
      WHERE pe."storeId" = $2 AND p."inStock" = TRUE AND p."price" <= $3
      ORDER BY pe."embedding" <=> $1::vector
      LIMIT $4
      `,
      vectorLiteral,
      input.storeId,
      input.budget,
      limit
    );
  }

  return prisma.$queryRawUnsafe<Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    inStock: boolean;
    similarity: number;
  }>>(
    `
    SELECT p."id", p."title", p."description", p."price", p."currency", p."inStock",
    (1 - (pe."embedding" <=> $1::vector)) AS similarity
    FROM "ProductEmbedding" pe
    JOIN "Product" p ON p."id" = pe."productId"
    WHERE pe."storeId" = $2 AND p."inStock" = TRUE
    ORDER BY pe."embedding" <=> $1::vector
    LIMIT $3
    `,
    vectorLiteral,
    input.storeId,
    limit
  );
}

export async function upsertKnowledgeEmbedding(input: {
  id: string;
  storeId: string;
  knowledgeSourceId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
}) {
  const vectorLiteral = `[${input.embedding.join(",")}]`;

  await prisma.$executeRawUnsafe(
    `
    INSERT INTO "KnowledgeChunk" ("id", "storeId", "knowledgeSourceId", "content", "embedding", "chunkIndex", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5::vector, $6, NOW(), NOW())
    ON CONFLICT ("knowledgeSourceId", "chunkIndex") DO UPDATE SET
      "content" = EXCLUDED."content",
      "embedding" = EXCLUDED."embedding",
      "updatedAt" = NOW()
    `,
    input.id,
    input.storeId,
    input.knowledgeSourceId,
    input.content,
    vectorLiteral,
    input.chunkIndex
  );
}

export async function queryKnowledgeSimilarity(input: {
  storeId: string;
  embedding: number[];
  limit?: number;
}) {
  const vectorLiteral = `[${input.embedding.join(",")}]`;
  const limit = input.limit || 6;

  return prisma.$queryRawUnsafe<Array<{
    sourceId: string;
    sourceType: string;
    sourceUrl: string;
    summaryText: string | null;
    content: string;
    similarity: number;
  }>>(
    `
    SELECT ks."id" as "sourceId", ks."type" as "sourceType", ks."url" as "sourceUrl", ks."summaryText",
    kc."content",
    (1 - (kc."embedding" <=> $1::vector)) AS similarity
    FROM "KnowledgeChunk" kc
    JOIN "KnowledgeSource" ks ON ks."id" = kc."knowledgeSourceId"
    WHERE kc."storeId" = $2 AND ks."status" = 'PUBLISHED'
    ORDER BY kc."embedding" <=> $1::vector
    LIMIT $3
    `,
    vectorLiteral,
    input.storeId,
    limit
  );
}
