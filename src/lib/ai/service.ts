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

  // Contextual Query Rewriting for Retrieval Memory
  let searchQuery = input.message;
  if (reversedHistory.length > 0) {
    const lastUserMessage = [...reversedHistory].reverse().find(m => m.role === "user");
    if (lastUserMessage && (input.message.length < 35 || /it|them|those|that|this|there|here/i.test(input.message))) {
      searchQuery = `${lastUserMessage.content} ${input.message}`;
    }
  }

  const handoff = shouldHandoff(intent, effectiveConfidence, priorFailures);

  // Retrieve products and knowledge based on expanded search query
  const retrievedProducts = await retrieveProductsForQuery(input.storeId, searchQuery);
  const knowledgeHits = await retrieveKnowledgeForQuery(input.storeId, searchQuery);

  const showProducts = intent === "product_discovery" || intent === "product_question";
  
  // CRITICAL: Map products to include the 'reason' field required by RecommendationEvent in DB
  const finalProducts = showProducts 
    ? retrievedProducts
        .filter((item) => item.similarity > 0.58)
        .slice(0, storeSettings?.aiMaxRecommendations ?? 3)
        .map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          currency: item.currency,
          inStock: item.inStock,
          reason: item.similarity > 0.8 ? "Highly relevant to your search" : "Recommended for you"
        }))
    : [];

  const missingPolicyKnowledge = (intent === "shipping_policy" || intent === "returns_policy") && 
    !knowledgeHits.some(k => k.similarity > 0.45);

  const reply = await generateSalesReply({
    message: storeSettings?.aiTone === "consultative" ? `${input.message} (respond with consultative tone)` : input.message,
    intent,
    history: reversedHistory.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    products: finalProducts, // Products now have reason
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
