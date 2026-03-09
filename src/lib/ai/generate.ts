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
  products: Array<{ title: string; price: number; currency: string; reason: string }>;
  knowledge: Array<{ sourceType: string; sourceUrl: string; summaryText: string; content: string }>;
  handoffRequired: boolean;
  brandContext?: {
    businessName: string | null;
    brandPersona: string | null;
    brandDescription: string | null;
  };
}): Promise<string> {
  const { message, intent, history = [], products, knowledge, handoffRequired, brandContext } = input;

  const systemPrompt = [
    "You are a concise ecommerce sales assistant.",
    brandContext?.businessName ? `You represent: ${brandContext.businessName}.` : "",
    brandContext?.brandPersona ? `Personality: ${brandContext.brandPersona}.` : "Personality: Professional & Helpful.",
    brandContext?.brandDescription ? `Context: ${brandContext.brandDescription}.` : "",
    "- Use the provided POLICY CONTEXT to answer all policy, shipping, or return questions.",
    "- If policy context is provided, YOU MUST give a specific answer based on it. Do NOT say 'refer to the website' if the info is right there.",
    "- Response MUST be under 3 sentences and professional.",
    "- Only recommend products if they strictly solve the user's specific request.",
    "- Never invent inventory details.",
    "- If handoff is required, briefly state that human help is coming.",
  ].filter(Boolean).join("\n");

  const conversationHistory = history.map(h => ({
    role: h.role,
    content: h.content
  }));

  const userContext = [
    `Current intent: ${intent}`,
    "\nContextually relevant products:",
    ...products.map((p) => `- ${p.title} (${p.currency} ${p.price}): ${p.reason}`),
    "\nPolicy context:",
    ...knowledge.map((k) => `[${k.sourceType}] ${k.summaryText || k.content.slice(0, 300)}`),
  ].join("\n");

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: `Context:\n${userContext}\n\nUser Question: ${message}` }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    return completion.choices[0].message?.content || "How else can I help you today?";
  } catch (error) {
    console.error("OpenAI generation failed:", error);
    return "I'm having trouble processing that right now. Could I get your email so someone can follow up?";
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
