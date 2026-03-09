import "server-only";

import { shopifyGraphQL } from "@/lib/shopify/client";

export type BillingTier = "STARTER" | "GROWTH" | "PRO";

const PLAN_PRICE: Record<BillingTier, number> = {
  STARTER: 19,
  GROWTH: 49,
  PRO: 99
};

export async function createShopifySubscription(input: {
  shopDomain: string;
  accessToken: string;
  tier: BillingTier;
  returnUrl: string;
}) {
  const amount = PLAN_PRICE[input.tier];

  const query = `mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $price: Decimal!) {
    appSubscriptionCreate(
      name: $name
      returnUrl: $returnUrl
      lineItems: [{ plan: { appRecurringPricingDetails: { price: { amount: $price, currencyCode: USD }, interval: EVERY_30_DAYS } } }]
      test: true
    ) {
      userErrors {
        field
        message
      }
      appSubscription {
        id
        status
      }
      confirmationUrl
    }
  }`;

  const result = await shopifyGraphQL<{
    appSubscriptionCreate: {
      userErrors: Array<{ field: string[]; message: string }>;
      appSubscription: { id: string; status: string } | null;
      confirmationUrl: string | null;
    };
  }>(input.shopDomain, input.accessToken, query, {
    name: `${input.tier} Plan`,
    returnUrl: input.returnUrl,
    price: amount
  });

  return result.appSubscriptionCreate;
}
