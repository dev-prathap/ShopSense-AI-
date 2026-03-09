import { adjustConfidenceBySensitivity, classifyIntent, shouldHandoff } from "@/lib/ai/intent";
import { generateSalesReply, shapeChatOutput } from "@/lib/ai/generate";
import { retrieveKnowledgeForQuery, retrieveProductsForQuery } from "@/lib/ai/retrieval";
import { prisma } from "@/lib/db/prisma";
import { ChatInput, ChatOutput } from "@/lib/ai/types";

export async function handleChat(input: ChatInput): Promise<ChatOutput> {
  const { intent, confidence } = await classifyIntent(input.message);
  
  const storeSettings = await prisma.store.findUnique({
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
  }) as any;

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

  const showProducts = intent === "product_discovery" || intent === "product_question";
  
  const maxProducts = storeSettings?.aiMaxRecommendations ?? 3;

  const toProductHit = (item: any, reason: string) => ({
    id: item.id,
    url: item.handle ? `https://${storeSettings.shopDomain}/products/${item.handle}` : undefined,
    title: item.title,
    description: item.description,
    price: typeof item.price === "number" ? item.price : Number(item.price),
    currency: item.currency,
    inStock: item.inStock,
    reason
  });

  let finalProducts: any[] = [];

  if (showProducts && retrievedProducts.length > 0) {
    // For discovery: just take top N — no threshold needed
    // For product_question: use a light threshold to stay precise
    const threshold = intent === "product_question" ? 0.35 : 0;
    finalProducts = (retrievedProducts as any[])
      .filter(item => item.similarity > threshold)
      .slice(0, maxProducts)
      .map(item => toProductHit(item, item.similarity > 0.7 ? "Highly relevant to your search" : "Recommended for you"));
  }

  // If intent says show products but retrieval returned nothing at all, query DB directly
  if (showProducts && finalProducts.length === 0) {
    const fallback = await prisma.product.findMany({
      where: { storeId: input.storeId },
      take: maxProducts,
      orderBy: { updatedAt: "desc" }
    });
    finalProducts = fallback.map(p => toProductHit(p, "Featured in our store"));
  }

  console.log(`[ShopSense] Final products: ${finalProducts.length} | Names: ${finalProducts.map(p => p.title).join(", ")}`);

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
    handoff: missingPolicyKnowledge ? { required: true, reason: "missing_policy_knowledge" } : handoff
  });
}
