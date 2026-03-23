export type ChatIntent =
  | "product_discovery"
  | "product_question"
  | "shipping_policy"
  | "order_tracking"
  | "returns_policy"
  | "billing_or_refund"
  | "small_talk"
  | "add_to_cart"
  | "unknown";

export interface ChatInput {
  storeId: string;
  conversationId: string;
  visitorId: string;
  message: string;
}

export interface ProductHit {
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
}

export interface ChatOutput {
  reply: string;
  intent: ChatIntent;
  confidence: number;
  products: ProductHit[];
  action?: {
    type: "add_to_cart";
    variantId: string;
    productTitle: string;
  };
  handoff: {
    required: boolean;
    reason?: string;
  };
}
