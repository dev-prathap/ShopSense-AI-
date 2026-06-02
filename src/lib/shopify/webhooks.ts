import "server-only";

import { shopifyGraphQL } from "@/lib/shopify/client";

// Must match the declarative config in shopify.app.toml. The toml is the source
// of truth for new installs; this list is only a fallback reconciliation path
// for legacy stores that installed before the declarative config was deployed.
export const REQUIRED_WEBHOOK_TOPICS = [
  "APP_UNINSTALLED",
  "APP_SUBSCRIPTIONS_UPDATE",
  "CUSTOMERS_CREATE",
  "CUSTOMERS_UPDATE",
  "PRODUCTS_CREATE",
  "PRODUCTS_UPDATE",
  "PRODUCTS_DELETE",
  "ORDERS_CREATE",
  "ORDERS_UPDATED",
  "INVENTORY_LEVELS_UPDATE",
  "CUSTOMERS_DATA_REQUEST",
  "CUSTOMERS_REDACT",
  "SHOP_REDACT"
] as const;

type ExistingWebhook = {
  id: string;
  topic: string;
  endpoint: {
    __typename: string;
    callbackUrl?: string;
  };
};

function getWebhookCallbackUrl(): string {
  const appUrl = process.env.SHOPIFY_APP_URL;
  if (!appUrl) {
    throw new Error("SHOPIFY_APP_URL is required for webhook registration");
  }

  return `${appUrl}/api/webhooks/shopify`;
}

export async function ensureShopifyWebhooks(input: { shopDomain: string; accessToken: string }) {
  const callbackUrl = getWebhookCallbackUrl();
  // Shopify webhook callbacks must be publicly reachable over HTTPS.
  if (!callbackUrl.startsWith("https://")) {
    return {
      callbackUrl,
      created: [] as string[],
      skipped: [] as string[],
      errors: [
        {
          topic: "ALL",
          message: "webhook_callback_must_be_https"
        }
      ]
    };
  }

  const existing = await shopifyGraphQL<{
    webhookSubscriptions: {
      edges: Array<{ node: ExistingWebhook }>;
    };
  }>(
    input.shopDomain,
    input.accessToken,
    `query ExistingWebhooks {
      webhookSubscriptions(first: 100) {
        edges {
          node {
            id
            topic
            endpoint {
              __typename
              ... on WebhookHttpEndpoint {
                callbackUrl
              }
            }
          }
        }
      }
    }`
  );

  const subscriptions = existing.webhookSubscriptions.edges.map((edge) => edge.node);
  const existingTopics = new Set(
    subscriptions
      .filter((subscription) => subscription.endpoint.__typename === "WebhookHttpEndpoint")
      .filter((subscription) => subscription.endpoint.callbackUrl === callbackUrl)
      .map((subscription) => subscription.topic)
  );

  const missingTopics = REQUIRED_WEBHOOK_TOPICS.filter((topic) => !existingTopics.has(topic));

  const created: string[] = [];
  const skipped: string[] = [...existingTopics];
  const errors: Array<{ topic: string; message: string }> = [];

  for (const topic of missingTopics) {
    const result = await shopifyGraphQL<{
      webhookSubscriptionCreate: {
        userErrors: Array<{ field: string[]; message: string }>;
        webhookSubscription: { id: string; topic: string } | null;
      };
    }>(
      input.shopDomain,
      input.accessToken,
      `mutation RegisterWebhook($topic: WebhookSubscriptionTopic!, $callbackUrl: URL!) {
        webhookSubscriptionCreate(
          topic: $topic,
          webhookSubscription: {
            callbackUrl: $callbackUrl,
            format: JSON
          }
        ) {
          userErrors {
            field
            message
          }
          webhookSubscription {
            id
            topic
          }
        }
      }`,
      {
        topic,
        callbackUrl
      }
    );

    if (result.webhookSubscriptionCreate.userErrors.length > 0 || !result.webhookSubscriptionCreate.webhookSubscription) {
      console.error(`[Shopify] Webhook creation failed for ${topic}:`, JSON.stringify(result.webhookSubscriptionCreate.userErrors));
      errors.push({
        topic,
        message: result.webhookSubscriptionCreate.userErrors[0]?.message || "unknown_webhook_create_error"
      });
      continue;
    }

    created.push(topic);
  }

  return {
    callbackUrl,
    created,
    skipped,
    errors
  };
}
