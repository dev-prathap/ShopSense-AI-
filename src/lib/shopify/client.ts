import "server-only";

const ADMIN_API_VERSION = "2025-01";

export async function shopifyGraphQL<T>(shopDomain: string, accessToken: string, query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`https://${shopDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error(`Shopify API request failed: ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors) {
    throw new Error(`Shopify API errors: ${JSON.stringify(payload.errors)}`);
  }

  return payload.data as T;
}

export function shopifyInstallUrl(shop: string, state: string): string {
  // Keep in step with access_scopes in shopify.app.toml, which is the list a
  // merchant actually approves for App Store installs. The previous fallback
  // here was missing read_inventory and read_customers, so an install that fell
  // back to it came away unable to sync stock levels or register the customer
  // webhooks.
  const scopes =
    process.env.SHOPIFY_SCOPES ||
    "read_products,read_inventory,read_orders,read_customers,read_script_tags,write_script_tags";
  const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/shopify/callback`;
  const apiKey = process.env.SHOPIFY_API_KEY;

  return `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
}

export async function exchangeShopifyAccessToken(shop: string, code: string): Promise<{ access_token: string }> {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code
    })
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed with status ${response.status}`);
  }

  return response.json();
}

export async function fetchShopifyOrderStatusByNumber(input: {
  shopDomain: string;
  accessToken: string;
  orderNumber: string;
}) {
  const data = await shopifyGraphQL<{
    orders: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          email: string | null;
          displayFinancialStatus: string | null;
          displayFulfillmentStatus: string | null;
          fulfillments: {
            edges: Array<{
              node: {
                trackingInfo: Array<{ number: string | null; url: string | null }>;
              };
            }>;
          };
        };
      }>;
    };
  }>(
    input.shopDomain,
    input.accessToken,
    `query OrderByName($query: String!) {
      orders(first: 1, query: $query, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            email
            displayFinancialStatus
            displayFulfillmentStatus
            fulfillments(first: 1) {
              edges {
                node {
                  trackingInfo(first: 1) {
                    number
                    url
                  }
                }
              }
            }
          }
        }
      }
    }`,
    { query: `name:#${input.orderNumber}` }
  );

  return data.orders.edges[0]?.node || null;
}
/**
 * Build the widget script-tag URL for a given store. Pure helper so
 * create/delete share the same source of truth.
 */
function widgetScriptUrl(storeId: string): string {
  return `${process.env.SHOPIFY_APP_URL}/widget.js?storeId=${storeId}`;
}

/**
 * Install the Neryn storefront widget as a ScriptTag on the merchant's theme.
 * Uses GraphQL Admin API (BFS 2025 requirement — REST /admin/api/.../script_tags.json
 * is deprecated for new apps). Idempotent: no-ops if a tag with the same src exists.
 *
 * NOTE: `ScriptTag` is scheduled for deprecation in a future API version. Long-term
 * migration target is a Theme App Extension (app embed block). Track as follow-up.
 */
export async function ensureShopifyScriptTag(shopDomain: string, accessToken: string, storeId: string) {
  const src = widgetScriptUrl(storeId);

  try {
    const existing = await shopifyGraphQL<{
      scriptTags: { edges: Array<{ node: { id: string; src: string } }> };
    }>(
      shopDomain,
      accessToken,
      `query ExistingScriptTags { scriptTags(first: 100) { edges { node { id src } } } }`
    );

    if (existing.scriptTags.edges.some((e) => e.node.src === src)) {
      return;
    }

    const created = await shopifyGraphQL<{
      scriptTagCreate: {
        userErrors: Array<{ field: string[]; message: string }>;
        scriptTag: { id: string } | null;
      };
    }>(
      shopDomain,
      accessToken,
      `mutation CreateScriptTag($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
          userErrors { field message }
          scriptTag { id }
        }
      }`,
      { input: { src, displayScope: "ALL_PAGES", cache: false } }
    );

    if (created.scriptTagCreate.userErrors.length > 0) {
      console.error(`[Shopify] ScriptTag create userErrors:`, created.scriptTagCreate.userErrors);
    }
  } catch (error) {
    console.error("[Shopify] ensureShopifyScriptTag error:", error instanceof Error ? error.message : error);
  }
}

/**
 * Delete the Neryn widget ScriptTag for a given store. Called on app/uninstalled
 * to leave the storefront clean. Best-effort: logs and swallows errors because
 * access may already be revoked at this point.
 */
export async function deleteShopifyScriptTag(shopDomain: string, accessToken: string, storeId: string) {
  const src = widgetScriptUrl(storeId);

  try {
    const existing = await shopifyGraphQL<{
      scriptTags: { edges: Array<{ node: { id: string; src: string } }> };
    }>(
      shopDomain,
      accessToken,
      `query ExistingScriptTags { scriptTags(first: 100) { edges { node { id src } } } }`
    );

    const target = existing.scriptTags.edges.find((e) => e.node.src === src);
    if (!target) return;

    await shopifyGraphQL<{
      scriptTagDelete: { userErrors: Array<{ field: string[]; message: string }>; deletedScriptTagId: string | null };
    }>(
      shopDomain,
      accessToken,
      `mutation DeleteScriptTag($id: ID!) {
        scriptTagDelete(id: $id) {
          userErrors { field message }
          deletedScriptTagId
        }
      }`,
      { id: target.node.id }
    );
  } catch (error) {
    // Uninstall may already have revoked the token — don't crash the webhook handler.
    console.warn("[Shopify] deleteShopifyScriptTag best-effort failed:", error instanceof Error ? error.message : error);
  }
}
