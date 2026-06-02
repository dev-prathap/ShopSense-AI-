import "server-only";

/**
 * Build the Shopify Managed Pricing URL for a merchant.
 *
 * Managed Pricing is Shopify's hosted plan-selection page. Merchants click a link
 * in our embedded app and are taken to Shopify's admin to pick / change plan.
 * Shopify then fires `app_subscriptions/update` webhook back to us.
 *
 * App handle is set in Partners Dashboard and defaults to the slug of the app name.
 * Configure via SHOPIFY_APP_HANDLE env var; falls back to "neryn".
 *
 * Docs: https://shopify.dev/docs/apps/launch/billing/managed-pricing
 */
export function getManagedPricingUrl(shopDomain: string): string {
  const appHandle = process.env.SHOPIFY_APP_HANDLE || "neryn";
  // shopDomain looks like "my-store.myshopify.com"; admin URL needs the prefix only.
  const storeHandle = shopDomain.replace(/\.myshopify\.com$/i, "");
  return `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`;
}
