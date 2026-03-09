import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ensureShopifyWebhooks } from "@/lib/shopify/webhooks";
import { syncCatalog } from "@/lib/shopify/sync";
import { fetchKnowledgeSources, publishKnowledgeSources, summarizeKnowledgeSources } from "@/lib/knowledge/service";

export type RetryJobType =
  | "ENSURE_WEBHOOKS"
  | "SYNC_CATALOG"
  | "HANDOFF_NOTIFY"
  | "FETCH_KNOWLEDGE"
  | "SUMMARIZE_KNOWLEDGE"
  | "PUBLISH_KNOWLEDGE";

export function computeBackoffSeconds(attempts: number): number {
  return Math.min(900, Math.pow(2, attempts) * 30);
}

function nextRun(attempts: number): Date {
  const delaySeconds = computeBackoffSeconds(attempts);
  return new Date(Date.now() + delaySeconds * 1000);
}

export async function enqueueRetryJob(input: {
  storeId: string;
  type: RetryJobType;
  payload?: Record<string, unknown>;
  errorMessage?: string;
}) {
  return prisma.retryJob.create({
    data: {
      storeId: input.storeId,
      type: input.type,
      payload: (input.payload ?? {}) as Prisma.InputJsonValue,
      status: "PENDING",
      nextRunAt: new Date(),
      lastError: input.errorMessage || null
    }
  });
}

async function runJob(job: {
  id: string;
  storeId: string;
  type: RetryJobType;
  attempts: number;
  payload: unknown;
}) {
  const store = await prisma.store.findUnique({ where: { id: job.storeId } });
  if (!store) {
    await prisma.retryJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        lastError: "store_not_found"
      }
    });
    return;
  }

  try {
    if (job.type === "ENSURE_WEBHOOKS") {
      const out = await ensureShopifyWebhooks({
        shopDomain: store.shopDomain,
        accessToken: store.accessToken
      });

      if (out.errors.length > 0) {
        throw new Error(`webhook_partial_failure:${JSON.stringify(out.errors)}`);
      }
    }

    if (job.type === "SYNC_CATALOG") {
      await syncCatalog(store.id);
    }

    if (job.type === "HANDOFF_NOTIFY") {
      const payload = (job.payload || {}) as {
        handoffWebhookUrl?: string;
        handoffPayload?: unknown;
      };
      if (!payload.handoffWebhookUrl || !payload.handoffPayload) {
        throw new Error("handoff_payload_missing");
      }

      const res = await fetch(payload.handoffWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload.handoffPayload)
      });

      if (!res.ok) {
        throw new Error(`handoff_webhook_http_${res.status}`);
      }
    }

    if (job.type === "FETCH_KNOWLEDGE") {
      const payload = (job.payload || {}) as { sourceIds?: string[] };
      const out = await fetchKnowledgeSources({
        storeId: store.id,
        sourceIds: payload.sourceIds,
        force: true
      });
      if (!out.ok) {
        throw new Error(out.reason || "fetch_knowledge_failed");
      }
    }

    if (job.type === "SUMMARIZE_KNOWLEDGE") {
      const payload = (job.payload || {}) as { sourceIds?: string[] };
      const out = await summarizeKnowledgeSources({
        storeId: store.id,
        sourceIds: payload.sourceIds,
        force: true
      });
      if (!out.ok) {
        throw new Error(out.reason || "summarize_knowledge_failed");
      }
    }

    if (job.type === "PUBLISH_KNOWLEDGE") {
      const payload = (job.payload || {}) as { sourceIds?: string[] };
      const out = await publishKnowledgeSources({
        storeId: store.id,
        sourceIds: payload.sourceIds,
        force: true
      });
      if (!out.ok) {
        throw new Error(out.reason || "publish_knowledge_failed");
      }
    }

    await prisma.retryJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        lastError: null
      }
    });
  } catch (error) {
    const attempts = job.attempts + 1;
    const reachedMax = attempts >= 6;

    await prisma.retryJob.update({
      where: { id: job.id },
      data: {
        status: reachedMax ? "FAILED" : "PENDING",
        attempts,
        nextRunAt: reachedMax ? new Date() : nextRun(attempts),
        lastError: error instanceof Error ? error.message.slice(0, 2000) : "job_failed"
      }
    });
  }
}

export async function processRetryJobs(input: { storeId: string; limit?: number }) {
  const limit = Math.min(50, Math.max(1, input.limit || 20));

  const jobs = await prisma.retryJob.findMany({
    where: {
      storeId: input.storeId,
      status: "PENDING",
      nextRunAt: {
        lte: new Date()
      }
    },
    orderBy: [{ createdAt: "asc" }],
    take: limit
  });

  let processed = 0;
  for (const job of jobs) {
    const claimed = await prisma.retryJob.updateMany({
      where: {
        id: job.id,
        status: "PENDING"
      },
      data: {
        status: "PROCESSING"
      }
    });

    if (claimed.count === 0) {
      continue;
    }

    await runJob({
      id: job.id,
      storeId: job.storeId,
      type: job.type as RetryJobType,
      attempts: job.attempts,
      payload: job.payload
    });
    processed += 1;
  }

  const summary = await prisma.retryJob.groupBy({
    by: ["status"],
    where: { storeId: input.storeId },
    _count: { status: true }
  });

  return {
    processed,
    status: summary.map((item) => ({
      status: item.status,
      count: item._count.status
    }))
  };
}

export async function processRetryJobsForAllStores(input?: { storeLimit?: number; jobLimitPerStore?: number }) {
  const storeLimit = Math.min(200, Math.max(1, input?.storeLimit || 50));
  const jobLimitPerStore = Math.min(50, Math.max(1, input?.jobLimitPerStore || 20));

  const dueStores = await prisma.retryJob.findMany({
    where: {
      status: "PENDING",
      nextRunAt: { lte: new Date() }
    },
    select: { storeId: true },
    distinct: ["storeId"],
    take: storeLimit
  });

  const perStoreResults: Array<{ storeId: string; processed: number }> = [];
  let totalProcessed = 0;

  for (const row of dueStores) {
    const result = await processRetryJobs({
      storeId: row.storeId,
      limit: jobLimitPerStore
    });
    perStoreResults.push({
      storeId: row.storeId,
      processed: result.processed
    });
    totalProcessed += result.processed;
  }

  return {
    storesChecked: dueStores.length,
    totalProcessed,
    stores: perStoreResults
  };
}
