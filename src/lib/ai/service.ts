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

  const toProductHit = (item: ProductItem | any, reason: string, variantMap: Map<string, any>): ProductHit => {
    const variant = variantMap.get(item.id);
    const shopDomain = storeSettings?.shopDomain || "myshopify.com";

    return {
      id: item.id,
      url: item.handle ? `https://${shopDomain}/products/${item.handle}` : undefined,
      title: item.title,
      description: item.description,
      price: typeof item.price === "number" ? item.price : Number(item.price || 0),
      currency: item.currency || "USD",
      inStock: !!item.inStock,
      reason,
      variantId: variant?.shopifyVariantId
    };
  };

  let finalProducts: ProductHit[] = [];

  if (showProducts && retrievedProducts.length > 0) {
    const threshold = (intent === "product_question" || intent === "add_to_cart") ? 0.35 : 0;
    const sorted = (retrievedProducts as ProductItem[])
      .filter(item => (item.similarity ?? 0) > threshold)
      .slice(0, maxProducts);

    // Batch fetch variants for all products to avoid N+1 queries
    const productIds = sorted.map(item => item.id);
    const variants = await prisma.productVariant.findMany({
      where: { productId: { in: productIds } },
      orderBy: { createdAt: "asc" },
    });

    // Create a map of productId -> first variant for quick lookup
    const variantMap = new Map<string, VariantItem>();
    variants.forEach(variant => {
      if (!variantMap.has(variant.productId)) {
        variantMap.set(variant.productId, variant);
      }
    });

    finalProducts = sorted.map(item =>
      toProductHit(item, (item.similarity ?? 0) > 0.7 ? "Highly relevant to your search" : "Recommended for you", variantMap)
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
    });

    const fallbackVariantMap = new Map<string, any>();
    fallbackVariants.forEach(variant => {
      if (!fallbackVariantMap.has(variant.productId)) {
        fallbackVariantMap.set(variant.productId, variant);
      }
    });

    finalProducts = fallback.map(p =>
      toProductHit(p, "Featured in our store", fallbackVariantMap)
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
