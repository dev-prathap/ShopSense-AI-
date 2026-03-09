import "server-only";

import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { KnowledgeSourceStatus, KnowledgeSourceType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { reserveIdempotencyKey } from "@/lib/security/idempotency";
import { createEmbedding } from "@/lib/ai/embeddings";
import { upsertKnowledgeEmbedding } from "@/lib/db/vector";
import { generateKnowledgeSummary } from "@/lib/knowledge/summarize";

const MAX_BODY_BYTES = 1_000_000;

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^\[::1\]$/i
];

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function stripHtml(html: string): string {
  return normalizeText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, "\"")
  );
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function parseKnowledgeType(input: string): KnowledgeSourceType {
  const upper = input.toUpperCase();
  if (upper === "PRIVACY" || upper === "SHIPPING" || upper === "RETURNS" || upper === "FAQ" || upper === "CONTACT" || upper === "CUSTOM") {
    return upper as KnowledgeSourceType;
  }
  throw new Error("invalid_knowledge_type");
}

function assertSafeUrl(rawUrl: string) {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("invalid_url");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("invalid_protocol");
  }

  const host = parsed.hostname.toLowerCase();
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(host))) {
    throw new Error("private_host_not_allowed");
  }
}

function chunkText(text: string, maxLen = 1000): string[] {
  const clean = normalizeText(text);
  if (!clean) return [];
  const out: string[] = [];
  let cursor = 0;
  while (cursor < clean.length) {
    const segment = clean.slice(cursor, cursor + maxLen);
    out.push(segment);
    cursor += Math.max(1, Math.floor(maxLen * 0.85));
  }
  return out.slice(0, 30);
}

export function inferKnowledgeReadiness(sources: Array<{ type: KnowledgeSourceType; status: KnowledgeSourceStatus }>): boolean {
  const published = new Set(
    sources.filter((s) => s.status === "PUBLISHED").map((s) => s.type)
  );
  const hasShipping = published.has("SHIPPING");
  const hasReturns = published.has("RETURNS");
  const hasFaqOrContact = published.has("FAQ") || published.has("CONTACT");
  return hasShipping && hasReturns && hasFaqOrContact;
}

export async function listKnowledgeSources(storeId: string) {
  const sources = await prisma.knowledgeSource.findMany({
    where: { storeId },
    orderBy: [{ type: "asc" }, { createdAt: "asc" }]
  });
  const ready = inferKnowledgeReadiness(sources.map((s) => ({ type: s.type, status: s.status })));
  return { sources, ready };
}

export async function upsertKnowledgeSources(input: {
  storeId: string;
  sources: Array<{ type: string; url: string }>;
}) {
  const normalized = input.sources
    .filter((s) => s.url.trim().length > 0)
    .map((s) => {
      const type = parseKnowledgeType(s.type);
      const url = s.url.trim();
      assertSafeUrl(url);
      return { type, url };
    });

  const baseTypes: KnowledgeSourceType[] = ["PRIVACY", "SHIPPING", "RETURNS", "FAQ", "CONTACT"];
  for (const type of baseTypes) {
    const latest = normalized.filter((s) => s.type === type).slice(-1)[0];
    if (!latest) continue;

    await prisma.knowledgeSource.deleteMany({
      where: {
        storeId: input.storeId,
        type,
        url: { not: latest.url }
      }
    });

    await prisma.knowledgeSource.upsert({
      where: {
        storeId_type_url: {
          storeId: input.storeId,
          type,
          url: latest.url
        }
      },
      update: {
        status: "PENDING",
        rawText: null,
        cleanText: null,
        summaryText: null,
        structuredFacts: Prisma.JsonNull,
        checksum: null,
        lastFetchedAt: null,
        approvedAt: null,
        publishedAt: null
      },
      create: {
        storeId: input.storeId,
        type,
        url: latest.url
      }
    });
  }

  const customUrls = normalized.filter((s) => s.type === "CUSTOM").map((s) => s.url);
  await prisma.knowledgeSource.deleteMany({
    where: {
      storeId: input.storeId,
      type: "CUSTOM",
      ...(customUrls.length ? { url: { notIn: customUrls } } : {})
    }
  });

  for (const url of customUrls) {
    await prisma.knowledgeSource.upsert({
      where: {
        storeId_type_url: {
          storeId: input.storeId,
          type: "CUSTOM",
          url
        }
      },
      update: {
        status: "PENDING",
        rawText: null,
        cleanText: null,
        summaryText: null,
        structuredFacts: Prisma.JsonNull,
        checksum: null,
        lastFetchedAt: null,
        approvedAt: null,
        publishedAt: null
      },
      create: {
        storeId: input.storeId,
        type: "CUSTOM",
        url
      }
    });
  }

  return listKnowledgeSources(input.storeId);
}

async function fetchAndExtract(url: string): Promise<{ rawText: string; cleanText: string; checksum: string }> {
  assertSafeUrl(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "AI-Sales-Agent-KnowledgeBot/1.0"
      }
    });
    if (!res.ok) {
      throw new Error(`fetch_failed_${res.status}`);
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const body = await res.arrayBuffer();
    const bytes = Buffer.from(body).subarray(0, MAX_BODY_BYTES);

    let rawText = "";
    if (contentType.includes("application/pdf")) {
      // v1 fallback: keep plain-text decode for PDFs; rich PDF extraction can be added post-MVP.
      rawText = bytes.toString("utf-8");
    } else {
      rawText = bytes.toString("utf-8");
    }

    const cleanText = contentType.includes("html") ? stripHtml(rawText) : normalizeText(rawText);
    if (!cleanText || cleanText.length < 20) {
      throw new Error("insufficient_content");
    }

    return {
      rawText: rawText.slice(0, 200_000),
      cleanText: cleanText.slice(0, 200_000),
      checksum: sha256(cleanText)
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchKnowledgeSources(input: {
  storeId: string;
  sourceIds?: string[];
  idempotencyKey?: string | null;
  force?: boolean;
}) {
  if (input.idempotencyKey) {
    const key = await reserveIdempotencyKey(`knowledge:fetch:${input.storeId}`, input.idempotencyKey);
    if (!key.ok) return { ok: false as const, reason: key.reason };
  }

  const sources = await prisma.knowledgeSource.findMany({
    where: {
      storeId: input.storeId,
      ...(input.sourceIds?.length ? { id: { in: input.sourceIds } } : {})
    }
  });

  const result: Array<{ id: string; status: KnowledgeSourceStatus; error?: string }> = [];
  for (const source of sources) {
    try {
      const out = await fetchAndExtract(source.url);
      const unchanged = !input.force && source.checksum && source.checksum === out.checksum;
      await prisma.knowledgeSource.update({
        where: { id: source.id },
        data: unchanged
          ? { lastFetchedAt: new Date() }
          : {
              rawText: out.rawText,
              cleanText: out.cleanText,
              checksum: out.checksum,
              lastFetchedAt: new Date(),
              status: "FETCHED",
              summaryText: null,
              structuredFacts: Prisma.JsonNull,
              approvedAt: null,
              publishedAt: null
            }
      });
      result.push({ id: source.id, status: unchanged ? source.status : "FETCHED" });
    } catch (error) {
      await prisma.knowledgeSource.update({
        where: { id: source.id },
        data: { status: "FAILED" }
      });
      result.push({ id: source.id, status: "FAILED", error: error instanceof Error ? error.message : "fetch_failed" });
    }
  }
  return { ok: true as const, result };
}

export async function summarizeKnowledgeSources(input: {
  storeId: string;
  sourceIds?: string[];
  idempotencyKey?: string | null;
  force?: boolean;
}) {
  if (input.idempotencyKey) {
    const key = await reserveIdempotencyKey(`knowledge:summarize:${input.storeId}`, input.idempotencyKey);
    if (!key.ok) return { ok: false as const, reason: key.reason };
  }

  const sources = await prisma.knowledgeSource.findMany({
    where: {
      storeId: input.storeId,
      ...(input.sourceIds?.length ? { id: { in: input.sourceIds } } : {}),
      cleanText: { not: null }
    }
  });

  const result: Array<{ id: string; status: KnowledgeSourceStatus; error?: string }> = [];
  for (const source of sources) {
    if (!input.force && source.summaryText && source.status !== "FAILED") {
      result.push({ id: source.id, status: source.status });
      continue;
    }
    try {
      const summary = await generateKnowledgeSummary({
        type: source.type,
        url: source.url,
        text: source.cleanText || ""
      });
      await prisma.knowledgeSource.update({
        where: { id: source.id },
        data: {
          summaryText: summary.summaryText,
          structuredFacts: summary.structuredFacts as Prisma.InputJsonValue,
          status: "SUMMARIZED"
        }
      });
      result.push({ id: source.id, status: "SUMMARIZED" });
    } catch (error) {
      await prisma.knowledgeSource.update({
        where: { id: source.id },
        data: { status: "FAILED" }
      });
      result.push({ id: source.id, status: "FAILED", error: error instanceof Error ? error.message : "summarize_failed" });
    }
  }
  return { ok: true as const, result };
}

export async function approveKnowledgeSources(input: { storeId: string; sourceIds?: string[] }) {
  const where = {
    storeId: input.storeId,
    ...(input.sourceIds?.length ? { id: { in: input.sourceIds } } : {})
  };
  await prisma.knowledgeSource.updateMany({
    where,
    data: {
      status: "APPROVED",
      approvedAt: new Date()
    }
  });
  return listKnowledgeSources(input.storeId);
}

export async function updateSourceSummary(input: {
  storeId: string;
  sourceId: string;
  summaryText: string;
  publish?: boolean;
}) {
  const source = await prisma.knowledgeSource.update({
    where: { id: input.sourceId, storeId: input.storeId },
    data: { 
      summaryText: input.summaryText,
      status: "APPROVED",
      approvedAt: new Date()
    }
  });

  if (input.publish) {
    await publishKnowledgeSources({
      storeId: input.storeId,
      sourceIds: [input.sourceId],
      force: true
    });
  }

  return listKnowledgeSources(input.storeId);
}

export async function publishKnowledgeSources(input: {
  storeId: string;
  sourceIds?: string[];
  idempotencyKey?: string | null;
  force?: boolean;
}) {
  if (input.idempotencyKey) {
    const key = await reserveIdempotencyKey(`knowledge:publish:${input.storeId}`, input.idempotencyKey);
    if (!key.ok) return { ok: false as const, reason: key.reason };
  }

  const sources = await prisma.knowledgeSource.findMany({
    where: {
      storeId: input.storeId,
      status: { in: ["APPROVED", "PUBLISHED"] },
      ...(input.sourceIds?.length ? { id: { in: input.sourceIds } } : {})
    }
  });

  const result: Array<{ id: string; status: KnowledgeSourceStatus; chunks: number; error?: string }> = [];
  for (const source of sources) {
    try {
      if (input.force) {
        await prisma.knowledgeChunk.deleteMany({ where: { knowledgeSourceId: source.id } });
      }
      const material = `${source.summaryText || ""}\n\n${source.cleanText || ""}`.trim();
      const chunks = chunkText(material);
      let embedded = 0;
      for (let idx = 0; idx < chunks.length; idx += 1) {
        const embedding = await createEmbedding(chunks[idx]);
        if (!embedding) continue;
        await upsertKnowledgeEmbedding({
          id: crypto.randomUUID(),
          storeId: input.storeId,
          knowledgeSourceId: source.id,
          chunkIndex: idx,
          content: chunks[idx],
          embedding
        });
        embedded += 1;
      }
      await prisma.knowledgeSource.update({
        where: { id: source.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date()
        }
      });
      result.push({ id: source.id, status: "PUBLISHED", chunks: embedded });
    } catch (error) {
      await prisma.knowledgeSource.update({
        where: { id: source.id },
        data: { status: "FAILED" }
      });
      result.push({ id: source.id, status: "FAILED", chunks: 0, error: error instanceof Error ? error.message : "publish_failed" });
    }
  }

  const { ready } = await listKnowledgeSources(input.storeId);
  const store = await prisma.store.findUnique({
    where: { id: input.storeId },
    select: { onboardingStep: true }
  });
  if (store) {
    await prisma.store.update({
      where: { id: input.storeId },
      data: {
        knowledgeReadyAt: ready ? new Date() : null,
        onboardingStep: ready ? { set: Math.max(store.onboardingStep, 3) } : undefined
      }
    });
  }

  return { ok: true as const, result, ready };
}
