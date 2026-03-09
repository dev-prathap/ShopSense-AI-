import "server-only";
import OpenAI from "openai";
import { ChatIntent } from "@/lib/ai/types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function classifyIntent(text: string): Promise<{ intent: ChatIntent; confidence: number }> {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Classify the following user message into ONE of these intents: 
          - product_discovery (searching for things to buy, "what do you have", "show me", "you have", "best products", "cheapest", "available items")
          - product_question (specific specs, size, material, "does this have", "how big")
          - shipping_policy (delivery time, where do you ship)
          - order_tracking (where is my order, status)
          - returns_policy (how to return, refund process)
          - billing_or_refund (charge issues, specific refund request)
          - small_talk (hi, thanks, how are you)
          - unknown
          
          Return ONLY the intent string. No other text.`
        },
        { role: "user", content: text }
      ],
      temperature: 0,
      max_tokens: 15
    });

    const intentText = response.choices[0].message?.content?.trim().toLowerCase() as ChatIntent;
    
    // Safety check to ensure it's a valid intent
    const validIntents: ChatIntent[] = [
      "product_discovery", "product_question", "shipping_policy", "order_tracking",
      "returns_policy", "billing_or_refund", "small_talk", "unknown"
    ];
    
    if (validIntents.includes(intentText)) {
      return { intent: intentText, confidence: 1.0 };
    }
    
    return { intent: "unknown", confidence: 0.5 };
  } catch (error) {
    console.error("Intent classification failed:", error);
    return { intent: "unknown", confidence: 0.4 };
  }
}

export function shouldHandoff(intent: ChatIntent, confidence: number, failureCount = 0): { required: boolean; reason?: string } {
  if (intent === "billing_or_refund") {
    return { required: true, reason: "billing_or_refund" };
  }

  if (confidence < 0.5) {
    return { required: true, reason: "low_confidence" };
  }

  if (failureCount >= 2) {
    return { required: true, reason: "repeated_failure" };
  }

  return { required: false };
}

export function adjustConfidenceBySensitivity(baseConfidence: number, sensitivity: number): number {
  const delta = (50 - sensitivity) / 250;
  const adjusted = baseConfidence + delta;
  return Math.max(0.05, Math.min(0.99, adjusted));
}
