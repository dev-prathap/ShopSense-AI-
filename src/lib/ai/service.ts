import { adjustConfidenceBySensitivity, classifyIntent, shouldHandoff } from "@/lib/ai/intent";
import { generateSalesReply, shapeChatOutput } from "@/lib/ai/generate";
import { retrieveKnowledgeForQuery, retrieveProductsForQuery } from "@/lib/ai/retrieval";
import { prisma } from "@/lib/db/prisma";
import { ChatInput, ChatOutput } from "@/lib/ai/types";

type StoreSettings = {
  shopDomain: string | null;
  businessName: string | null;
  brandPersona: string | null;
  brandDescription: string | null;
  aiTone: string | null;
  aiMaxRecommendations: number | null;
  aiHandoffSensitivity: number | null;
};

type ProductHit = {
  id: string;
  url?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  inStock: boolean;
  reason: string;
  variantId?: string;
  variants?: Array<{
    variant_name: string;
    sku: string | null;
    in_stock: boolean;
    shopify_variant_id: string;
  }>;
  rating?: number | null;
  review_count?: number | null;
  top_reviews?: string[];
};

type ProductItem = {
  id: string;
  handle?: string;
  title: string;
  description: string;
  price: string | number;
  currency: string;
  inStock: boolean;
  similarity?: number;
};

type VariantItem = {
  shopifyVariantId: string;
  productId: string;
  title: string;
  sku: string | null;
  inventoryQty: number;
};

type ProductDetail = {
  id: string;
  handle: string | null;
  title: string;
  description: string;
  price: unknown;
  currency: string;
  inStock: boolean;
  metadata?: any;
};

type ChatAction = {
  type: "add_to_cart";
  variantId: string;
  productTitle: string;
} | undefined;

export async function handleChat(input: ChatInput): Promise<ChatOutput> {
  const { intent, confidence } = await classifyIntent(input.message);
  
  const storeSettings: StoreSettings | null = await prisma.store.findUnique({
    where: { id: input.storeId },
    select: {
      shopDomain: true,
      businessName: true,
      brandPersona: true,
      brandDescription: true,
      aiTone: true,
      aiMaxRecommendations: true,
      aiHandoffSensitivity: true
    }
  });

  const effectiveConfidence = adjustConfidenceBySensitivity(confidence, storeSettings?.aiHandoffSensitivity ?? 50);

  const history = await prisma.message.findMany({
    where: { conversationId: input.conversationId },
    orderBy: { createdAt: "desc" },
    take: 6
  });
  const reversedHistory = [...history].reverse();
  const priorFailures = history.filter(m => m.role === "assistant" && (m.confidence ?? 1) < 0.5).length;

  // Contextual Query Rewriting — only for pronoun-based follow-ups
  let searchQuery = input.message;
  if (reversedHistory.length > 0) {
    const lastUserMessage = [...reversedHistory].reverse().find(m => m.role === "user");
    // Only expand if the user uses a pronoun reference AND the previous message is different
    if (lastUserMessage && lastUserMessage.content !== input.message && /\b(it|them|those|that|this|these|one)\b/i.test(input.message)) {
      searchQuery = `${lastUserMessage.content} ${input.message}`;
    }
  }

  const handoff = shouldHandoff(intent, effectiveConfidence, priorFailures);

  // Retrieve products and knowledge
  const retrievedProducts = await retrieveProductsForQuery(input.storeId, searchQuery);
  const knowledgeHits = await retrieveKnowledgeForQuery(input.storeId, searchQuery);

  const showProducts = intent === "product_discovery" || intent === "product_question" || intent === "add_to_cart";
  
  const maxProducts = storeSettings?.aiMaxRecommendations ?? 3;

  const toProductHit = (
    item: ProductItem | any,
    reason: string,
    variantMap: Map<string, VariantItem[]>,
    detailMap: Map<string, ProductDetail>
  ): ProductHit => {
    const variants = variantMap.get(item.id) || [];
    const primaryVariant = variants.find(v => v.inventoryQty > 0) || variants[0];
    const detail = detailMap.get(item.id);
    const metadata = detail?.metadata && typeof detail.metadata === "object" ? detail.metadata : {};
    const topReviews = Array.isArray(metadata?.top_reviews)
      ? metadata.top_reviews.filter((v: unknown) => typeof v === "string").slice(0, 3)
      : [];
    const rating = typeof metadata?.rating === "number" ? metadata.rating : null;
    const reviewCount = typeof metadata?.review_count === "number" ? metadata.review_count : null;
    const shopDomain = storeSettings?.shopDomain || "myshopify.com";

    const resolvedPrice = detail?.price ?? item.price;

    return {
      id: item.id,
      url: (detail?.handle || item.handle) ? `https://${shopDomain}/products/${detail?.handle || item.handle}` : undefined,
      title: detail?.title || item.title,
      description: detail?.description || item.description,
      price: typeof resolvedPrice === "number" ? Number(resolvedPrice) : Number(resolvedPrice || 0),
      currency: detail?.currency || item.currency || "USD",
      inStock: typeof detail?.inStock === "boolean" ? detail.inStock : !!item.inStock,
      reason,
      variantId: primaryVariant?.shopifyVariantId,
      variants: variants.map((v) => ({
        variant_name: v.title,
        sku: v.sku,
        in_stock: v.inventoryQty > 0,
        shopify_variant_id: v.shopifyVariantId
      })),
      rating,
      review_count: reviewCount,
      top_reviews: topReviews
    };
  };

  let finalProducts: ProductHit[] = [];

  if (showProducts && retrievedProducts.length > 0) {
    const threshold = (intent === "product_question" || intent === "add_to_cart") ? 0.35 : 0;
    const sorted = (retrievedProducts as ProductItem[])
      .filter(item => (item.similarity ?? 0) > threshold)
      .slice(0, maxProducts);

    // Batch fetch product details + variants for all products to avoid N+1 queries
    const productIds = sorted.map(item => item.id);
    const details = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        handle: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        inStock: true,
        metadata: true
      }
    });
    const variants = await prisma.productVariant.findMany({
      where: { productId: { in: productIds } },
      orderBy: { createdAt: "asc" },
      select: {
        shopifyVariantId: true,
        productId: true,
        title: true,
        sku: true,
        inventoryQty: true
      }
    });

    // Create maps keyed by productId
    const detailMap = new Map<string, ProductDetail>();
    details.forEach((d) =>
      detailMap.set(d.id, {
        id: d.id,
        handle: d.handle,
        title: d.title,
        description: d.description,
        price: d.price,
        currency: d.currency,
        inStock: d.inStock,
        metadata: d.metadata
      })
    );

    const variantMap = new Map<string, VariantItem[]>();
    variants.forEach(variant => {
      const list = variantMap.get(variant.productId) || [];
      list.push(variant as VariantItem);
      variantMap.set(variant.productId, list);
    });

    finalProducts = sorted.map(item =>
      toProductHit(item, (item.similarity ?? 0) > 0.7 ? "Highly relevant to your search" : "Recommended for you", variantMap, detailMap)
    );
  }

  // Fallback if empty
  if (showProducts && finalProducts.length === 0) {
    const fallback = await prisma.product.findMany({
      where: { storeId: input.storeId },
      take: maxProducts,
      orderBy: { updatedAt: "desc" }
    });

    // Batch fetch variants for fallback products too
    const fallbackProductIds = fallback.map(p => p.id);
    const fallbackVariants = await prisma.productVariant.findMany({
      where: { productId: { in: fallbackProductIds } },
      orderBy: { createdAt: "asc" },
      select: {
        shopifyVariantId: true,
        productId: true,
        title: true,
        sku: true,
        inventoryQty: true
      }
    });

    const fallbackVariantMap = new Map<string, VariantItem[]>();
    fallbackVariants.forEach(variant => {
      const list = fallbackVariantMap.get(variant.productId) || [];
      list.push(variant as VariantItem);
      fallbackVariantMap.set(variant.productId, list);
    });

    const fallbackDetailMap = new Map<string, ProductDetail>();
    fallback.forEach((p) =>
      fallbackDetailMap.set(p.id, {
        id: p.id,
        handle: (p as any).handle || null,
        title: p.title,
        description: p.description,
        price: p.price,
        currency: p.currency,
        inStock: p.inStock,
        metadata: (p as any).metadata
      })
    );

    finalProducts = fallback.map(p =>
      toProductHit(p, "Featured in our store", fallbackVariantMap, fallbackDetailMap)
    );
  }

  let action: ChatAction = undefined;
  if (intent === "add_to_cart" && finalProducts.length > 0) {
    const best = finalProducts[0];
    if (best.variantId) {
      action = {
        type: "add_to_cart",
        variantId: best.variantId,
        productTitle: best.title
      };
    }
  }

  console.log(`[Neryn] Intent: ${intent} | Final products: ${finalProducts.length}`);

  const missingPolicyKnowledge = (intent === "shipping_policy" || intent === "returns_policy") && 
    !knowledgeHits.some(k => k.similarity > 0.45);

  const reply = await generateSalesReply({
    message: storeSettings?.aiTone === "consultative" ? `${input.message} (respond with consultative tone)` : input.message,
    intent,
    history: reversedHistory.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    products: finalProducts,
    knowledge: knowledgeHits
      .filter((k) => k.similarity > 0.45)
      .slice(0, 3)
      .map((k) => ({
        sourceType: k.sourceType,
        sourceUrl: k.sourceUrl,
        summaryText: k.summaryText || "",
        content: k.content
      })),
    handoffRequired: handoff.required || missingPolicyKnowledge,
    brandContext: {
      businessName: storeSettings?.businessName ?? null,
      brandPersona: storeSettings?.brandPersona ?? null,
      brandDescription: storeSettings?.brandDescription ?? null
    }
  });

  return shapeChatOutput({
    reply,
    intent,
    confidence: effectiveConfidence,
    products: finalProducts,
    action,
    handoff: missingPolicyKnowledge ? { required: true, reason: "missing_policy_knowledge" } : handoff
  });
}
