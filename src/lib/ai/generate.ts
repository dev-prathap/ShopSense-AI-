import "server-only";
import OpenAI from "openai";
import { ChatOutput } from "@/lib/ai/types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateSalesReply(input: {
  message: string;
  intent: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  products: Array<{ title: string; price: number; currency: string; reason: string; url?: string }>;
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

  // ─────────────────────────────────────────────────────────────
  // SYSTEM PROMPT — Enterprise-grade Sales AI Brain
  // ─────────────────────────────────────────────────────────────
  const systemPrompt = `You are ShopSense AI — an elite, context-aware sales assistant exclusively for ${storeName}.

## YOUR IDENTITY
- You are a friendly, knowledgeable shopping advisor who works ONLY for ${storeName}.
- Personality: ${persona}.
- You speak in the same language the customer uses. If they write in Tamil, Hindi, Tanglish, or any other language, you MUST reply in that same language naturally.
${brandContext?.brandDescription ? `- Store context: ${brandContext.brandDescription}` : ""}

## ABSOLUTE RULES (NEVER VIOLATE)
1. **CATALOG-ONLY**: You may ONLY mention, recommend, or describe products that appear in the <<STORE_CATALOG>> section below. If a product is NOT listed there, it does NOT exist in this store. Period.
2. **ZERO HALLUCINATION**: Never invent product names, prices, features, stock levels, or URLs. Every fact must come from the provided context.
3. **NO EXTERNAL KNOWLEDGE**: Do not use your training data to suggest generic products (e.g., "headphones", "blenders"). You are NOT a general shopping assistant — you serve ONLY this store's catalog.
4. **EMPTY CATALOG RESPONSE**: If <<STORE_CATALOG>> is empty or says "NONE", respond with: "I couldn't find those items in our catalog right now. Would you like to browse what we do have, or can I help with something else?"

## RESPONSE STYLE
- Keep responses under 3 sentences. Be concise, warm, and action-oriented.
- Use the AIDA framework subtly: grab **A**ttention → build **I**nterest → create **D**esire → drive **A**ction.
- When listing products, use markdown links: [Product Name](url).
- Add a soft call-to-action when recommending products (e.g., "Want me to check sizes?" or "Shall I add this to your cart?").
- For policy questions, give direct answers from <<POLICY_CONTEXT>>. Never say "check the website" if the answer is provided.

## INTENT-SPECIFIC BEHAVIOR
- **product_discovery / product_question**: Show products from <<STORE_CATALOG>> with prices. Be enthusiastic but honest.
- **shipping_policy / returns_policy**: Answer from <<POLICY_CONTEXT>> only. If no policy context exists, say "I'll connect you with our team for the most accurate info."
- **order_tracking**: Ask for order number/email if not provided.
- **billing_or_refund**: Acknowledge the concern empathetically and confirm handoff to a human agent.
- **small_talk**: Be warm and brief, then gently steer toward shopping: "Happy to chat! By the way, we have some great new arrivals 😊"

## HANDOFF PROTOCOL
${handoffRequired ? "⚠️ HANDOFF IS ACTIVE: A human agent will take over shortly. Briefly acknowledge the customer's concern, assure them help is on the way, and keep your response under 2 sentences." : "Handoff is NOT required. Handle the conversation yourself."}

## LANGUAGE INTELLIGENCE
- Detect the customer's language automatically and respond in the SAME language.
- Support: English, Tamil, Hindi, Tanglish (Tamil+English mix), and other common languages.
- Never force English if the customer writes in another language.`;

  // ─────────────────────────────────────────────────────────────
  // USER CONTEXT — Structured data injection
  // ─────────────────────────────────────────────────────────────
  const catalogSection = products.length > 0
    ? products.map((p, i) => `  ${i + 1}. ${p.title} — ${p.currency} ${p.price}${p.url ? ` | Link: ${p.url}` : ""}\n     Match reason: ${p.reason}`).join("\n")
    : "  NONE — This store does not carry items matching the query.";

  const policySection = knowledge.length > 0
    ? knowledge.map((k) => `  [${k.sourceType}] ${k.summaryText || k.content.slice(0, 400)}`).join("\n")
    : "  No policy context available.";

  const userContext = `## DETECTED INTENT: ${intent}

<<STORE_CATALOG>>
${catalogSection}

<<POLICY_CONTEXT>>
${policySection}

---
Customer message: "${message}"`;

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
    console.error("ShopSense AI generation failed:", error);
    return "I'm having a brief technical moment. Could I get your email so our team can follow up personally?";
  }
}

export function shapeChatOutput(data: {
  reply: string;
  intent: ChatOutput["intent"];
  confidence: number;
  products: ChatOutput["products"];
  handoff: ChatOutput["handoff"];
}): ChatOutput {
  return data;
}
