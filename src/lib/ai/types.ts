export type ChatIntent =
  | "product_discovery"
  | "product_question"
  | "shipping_policy"
  | "order_tracking"
  | "returns_policy"
  | "billing_or_refund"
  | "small_talk"
  | "unknown";

export interface ChatInput {
  storeId: string;
  conversationId: string;
  visitorId: string;
  message: string;
}

export interface ProductHit {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  inStock: boolean;
  reason: string;
}

export interface ChatOutput {
  reply: string;
  intent: ChatIntent;
  confidence: number;
  products: ProductHit[];
  handoff: {
    required: boolean;
    reason?: string;
  };
}
