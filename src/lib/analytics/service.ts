import { prisma } from "@/lib/db/prisma";
import { SyncHealthSnapshot } from "@/lib/ui/contracts";

export interface AnalyticsSnapshot {
  conversations: number;
  attributedRevenue: number;
  convertedConversations: number;
  recoveryAcceptanceRate: number;
  topIntents: Array<{ intent: string; count: number }>;
  sync: SyncHealthSnapshot;
}

export async function getAnalyticsSnapshot(storeId: string): Promise<AnalyticsSnapshot> {
  const [conversations, conversions, recommendations, recoveryOffers, topIntents, productAgg, variantCount, ordersCached, knowledgeAgg, knowledgeChunkCount] = await Promise.all([
    prisma.conversation.count({ where: { storeId } }),
    prisma.conversation.count({ where: { storeId, convertedAt: { not: null } } }),
    prisma.recommendationEvent.findMany({ where: { storeId } }),
    prisma.recoveryOffer.findMany({ where: { storeId } }),
    prisma.message.groupBy({
      by: ["intent"],
      where: {
        conversation: {
          storeId
        },
        intent: {
          not: null
        }
      },
      _count: {
        intent: true
      },
      orderBy: {
        _count: {
          intent: "desc"
        }
      },
      take: 5
    }),
    prisma.product.aggregate({
      where: { storeId },
      _count: { _all: true },
      _max: { updatedAt: true }
    }),
    prisma.productVariant.count({ where: { storeId } }),
    prisma.orderCache.count({ where: { storeId } }),
    prisma.knowledgeSource.aggregate({
      where: { storeId },
      _count: { _all: true },
      _max: {
        lastFetchedAt: true,
        publishedAt: true
      }
    }),
    prisma.knowledgeChunk.count({ where: { storeId } })
  ]);

  const attributedRevenue = recommendations.reduce((sum, event) => sum + Number(event.attributedRevenue || 0), 0);
  const accepted = recoveryOffers.filter((offer) => Boolean(offer.acceptedAt)).length;
  const inStockProducts = await prisma.product.count({ where: { storeId, inStock: true } });
  const knowledgePublished = await prisma.knowledgeSource.count({
    where: { storeId, status: "PUBLISHED" }
  });

  return {
    conversations,
    attributedRevenue,
    convertedConversations: conversions,
    recoveryAcceptanceRate: recoveryOffers.length === 0 ? 0 : accepted / recoveryOffers.length,
    topIntents: topIntents.map((row) => ({
      intent: row.intent || "unknown",
      count: row._count.intent
    })),
    sync: {
      products: productAgg._count._all,
      inStockProducts,
      variants: variantCount,
      ordersCached,
      lastCatalogUpdateAt: productAgg._max.updatedAt || null,
      knowledgeSourcesTotal: knowledgeAgg._count._all,
      knowledgePublished,
      knowledgeChunks: knowledgeChunkCount,
      lastKnowledgeFetchAt: knowledgeAgg._max.lastFetchedAt || null,
      lastKnowledgePublishedAt: knowledgeAgg._max.publishedAt || null
    }
  };
}
