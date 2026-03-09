import { describe, expect, it } from "vitest";
import { REQUIRED_WEBHOOK_TOPICS } from "../src/lib/shopify/webhooks";

describe("required webhooks", () => {
  it("contains expected Shopify topics without duplicates", () => {
    const unique = new Set(REQUIRED_WEBHOOK_TOPICS);

    expect(unique.size).toBe(REQUIRED_WEBHOOK_TOPICS.length);
    expect(REQUIRED_WEBHOOK_TOPICS).toContain("APP_UNINSTALLED");
    expect(REQUIRED_WEBHOOK_TOPICS).toContain("APP_SUBSCRIPTIONS_UPDATE");
    expect(REQUIRED_WEBHOOK_TOPICS).toContain("CUSTOMERS_CREATE");
    expect(REQUIRED_WEBHOOK_TOPICS).toContain("CUSTOMERS_UPDATE");
    expect(REQUIRED_WEBHOOK_TOPICS).toContain("PRODUCTS_CREATE");
    expect(REQUIRED_WEBHOOK_TOPICS).toContain("PRODUCTS_UPDATE");
    expect(REQUIRED_WEBHOOK_TOPICS).toContain("INVENTORY_LEVELS_UPDATE");
    expect(REQUIRED_WEBHOOK_TOPICS).toContain("ORDERS_CREATE");
    expect(REQUIRED_WEBHOOK_TOPICS).toContain("ORDERS_UPDATED");
  });
});
