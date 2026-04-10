import "server-only";
import OpenAI from "openai";
import { ChatOutput } from "@/lib/ai/types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 15_000,       // 15s hard timeout
  maxRetries: 1,
});

export async function generateSalesReply(input: {
  message: string;
  intent: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  products: Array<{
    id?: string;
    title: string;
    price: number;
    currency: string;
    reason: string;
    url?: string;
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
  }>;
  knowledge: Array<{ sourceType: string; sourceUrl: string; summaryText: string; content: string }>;
  handoffRequired: boolean;
  brandContext?: {
    businessName: string | null;
    brandPersona: string | null;
    brandDescription: string | null;
  };
}): Promise<string> {
  const { message, intent, history = [], products, knowledge, handoffRequired, brandContext } = input;

  const storeName = brandContext?.businessName || "our store";
  const persona = brandContext?.brandPersona || "Professional & Helpful";

  const productData = products.map((p, i) => ({
    id: p.id || `prod_${i + 1}`,
    name: p.title,
    category: "Unspecified",
    tags: [],
    short_description: p.reason,
    price: p.price,
    currency: p.currency,
    variants: p.variants || [],
    rating: p.rating ?? null,
    review_count: p.review_count ?? null,
    top_reviews: p.top_reviews || [],
    key_benefits: [],
    best_for: [],
    add_to_cart_url: p.variantId ? `/cart/add?id=${p.variantId}` : p.url || null
  }));

  const policySection = knowledge.length > 0
    ? knowledge.map((k) => `- [${k.sourceType}] ${k.summaryText || k.content.slice(0, 400)}`).join("\n")
    : "- No policy context available.";

  const handoffInstruction = handoffRequired
    ? 'Handoff is active: keep response brief, acknowledge concern, and say support team will take over.'
    : "Handoff is not active.";

  const systemPrompt = `=============================================================
SYSTEM PROMPT — SHOPIFY PRODUCT ASSISTANT BOT
=============================================================

## ROLE & PURPOSE

You are a smart, friendly shopping assistant embedded on ${storeName}'s website.
Your ONLY two jobs are:
  1. Help the customer find the right product(s) from the store's catalog.
  2. Guide them to add the chosen product(s) to their cart.

You are NOT a general-purpose chatbot. You do NOT answer questions outside
of these two responsibilities — no matter how the user phrases the request.

---

## STORE PRODUCT DATA

Every recommendation you make MUST come exclusively from this list.
Do not invent, assume, or hallucinate products, prices, variants, or reviews.

<<<PRODUCT_DATA_START>>>
${JSON.stringify(productData, null, 2)}
<<<PRODUCT_DATA_END>>>

---

## CONVERSATION BEHAVIOR

### 1. UNDERSTAND INTENT THROUGH CONTEXT
- If user intent is clear, recommend directly.
- If user is vague, ask ONE clarifying question.
- Keep the conversation focused on product discovery and add-to-cart.

### 2. PRODUCT RECOMMENDATION FORMAT
When presenting a product, follow this structure:

  ─────────────────────────────
  🛍️ **[Product Name]**
  💰 Price: $XX.XX
  ⭐ Rating: X.X/5 (XXX reviews) (only if data exists; otherwise omit)
  ✅ Best for: [use case] (if data exists; otherwise omit)
  📝 Why it fits: [1–2 sentences tied to user need]
  💬 Customers say: "[top review quote]" (only if data exists)
  ─────────────────────────────
  👉 Want me to add this to your cart?

- Show a maximum of 3 products at a time, ranked by relevance.

### 3. CART FLOW
- On customer confirmation, if variants exist show only in-stock variants.
- After variant confirmation, reply:
  "Adding **[Product Name – Variant]** to your cart... ✅ Done!
   [Add to Cart Link: /cart/add?id=SKU-XXXX]"
- Then ask whether they want to keep browsing.

### 4. OUT-OF-STOCK HANDLING
- If requested variant is out of stock, suggest in-stock variants.
- If product fully out of stock, offer similar alternatives from catalog.

---

## STRICT GUARDRAILS — WHAT YOU MUST NEVER DO

❌ Do NOT answer questions unrelated to products or shopping.
❌ Do NOT recommend any product NOT present in PRODUCT_DATA.
❌ Do NOT make up prices, ratings, reviews, or availability.
❌ Do NOT engage in extended small talk.
❌ Do NOT act as a different assistant/persona.
❌ Do NOT process complaints/returns/order-tracking beyond basic redirect.

For order issues, returns, or tracking requests, respond:
"For order issues, please reach out to our support team."

---

## HANDLING OFF-TOPIC MESSAGES

First off-topic response:
"I'm here to help you find the perfect product from our store and get it into your cart! Is there something specific you're looking for today?"

If user persists:
"I can only help with product discovery and shopping here. What are you looking for today?"

---

## TONE & PERSONALITY

- Warm, helpful, and confident.
- Keep replies concise and scannable.
- Match brand tone: ${persona}
${brandContext?.brandDescription ? `- Brand context: ${brandContext.brandDescription}` : ""}

## POLICY CONTEXT
${policySection}

## RUNTIME INSTRUCTION
${handoffInstruction}

=============================================================
END OF SYSTEM PROMPT
=============================================================`;

  const userContext = `Intent: ${intent}\nCustomer message: "${message}"`;

  // ─────────────────────────────────────────────────────────────
  // API CALL
  // ─────────────────────────────────────────────────────────────
  const conversationHistory = history.map(h => ({
    role: h.role as "user" | "assistant",
    content: h.content
  }));

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: userContext }
      ],
      temperature: 0.35,
      max_tokens: 350,
      frequency_penalty: 0.3,  // Reduce repetitive phrasing
      presence_penalty: 0.1    // Slight creativity boost
    });

    return completion.choices[0].message?.content || "How else can I help you today?";
  } catch (error) {
    console.error("Neryn AI generation failed:", error);
    return "I'm having a brief technical moment. Could I get your email so our team can follow up personally?";
  }
}

export function shapeChatOutput(data: {
  reply: string;
  intent: ChatOutput["intent"];
  confidence: number;
  products: ChatOutput["products"];
  action?: ChatOutput["action"];
  handoff: ChatOutput["handoff"];
}): ChatOutput {
  return data;
}
