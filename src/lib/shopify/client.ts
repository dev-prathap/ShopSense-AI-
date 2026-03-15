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
  const scopes = process.env.SHOPIFY_SCOPES || "read_products,read_orders,read_script_tags,write_script_tags";
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
export async function ensureShopifyScriptTag(shopDomain: string, accessToken: string, storeId: string) {
  const scriptUrl = `${process.env.SHOPIFY_APP_URL}/widget.js?storeId=${storeId}`;
  
  try {
    // 1. Check if already exists to avoid duplicates
    const checkResponse = await fetch(`https://${shopDomain}/admin/api/${ADMIN_API_VERSION}/script_tags.json`, {
      headers: { "X-Shopify-Access-Token": accessToken }
    });
    
    if (checkResponse.ok) {
      const { script_tags } = await checkResponse.json();
      if (script_tags?.some((s: any) => s.src === scriptUrl)) {
        console.log(`[Shopify] ScriptTag already exists for ${shopDomain}`);
        return; 
      }
    }

    // 2. Create the script tag
    const createResponse = await fetch(`https://${shopDomain}/admin/api/${ADMIN_API_VERSION}/script_tags.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken
      },
      body: JSON.stringify({
        script_tag: {
          event: "onload",
          src: scriptUrl
        }
      })
    });

    if (createResponse.ok) {
      console.log(`[Shopify] ScriptTag installed successfully for ${shopDomain}`);
    } else {
      const err = await createResponse.text();
      console.error(`[Shopify] ScriptTag installation failed: ${err}`);
    }
  } catch (error) {
    console.error("[Shopify] ScriptTag error:", error);
  }
}
