import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * The requested scopes are written down in three places, and they had already
 * drifted: shopify.app.toml asked for seventeen, .env.example repeated those
 * seventeen, and the fallback in shopifyInstallUrl asked for four — missing
 * read_inventory and read_customers, which the catalog sync and the customer
 * webhooks both need. A merchant approves the toml list verbatim, so drift here
 * is a merchant-facing permissions bug, not a config tidiness issue.
 */

const root = path.join(__dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");

function parseScopes(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .sort();
}

function extract(source: string, pattern: RegExp, label: string): string[] {
  const match = source.match(pattern);
  if (!match) throw new Error(`could not find the scope list in ${label}`);
  return parseScopes(match[1]);
}

const tomlScopes = extract(
  read("shopify.app.toml"),
  /\[access_scopes\][\s\S]*?^scopes\s*=\s*"([^"]+)"/m,
  "shopify.app.toml"
);

const envExampleScopes = extract(
  read(".env.example"),
  /^SHOPIFY_SCOPES="([^"]+)"/m,
  ".env.example"
);

const fallbackScopes = extract(
  read("src/lib/shopify/client.ts"),
  /process\.env\.SHOPIFY_SCOPES\s*\|\|\s*\n?\s*"([^"]+)"/,
  "shopifyInstallUrl fallback"
);

describe("requested Shopify scopes", () => {
  it("shopify.app.toml and the shopifyInstallUrl fallback agree", () => {
    expect(fallbackScopes).toEqual(tomlScopes);
  });

  it("shopify.app.toml and .env.example agree", () => {
    expect(envExampleScopes).toEqual(tomlScopes);
  });

  it("requests no write access at all", () => {
    // Neryn performs no Admin API writes. The storefront widget was the only
    // thing that ever needed one, and it now ships as a theme app extension the
    // merchant enables themselves. A write scope reappearing here means either
    // new write code or an over-request — both worth a deliberate look, since
    // merchants approve this list verbatim.
    expect(tomlScopes.filter((s) => s.startsWith("write_"))).toEqual([]);
  });

  it("requests no script tag access, since the widget is a theme app extension", () => {
    expect(tomlScopes.filter((s) => s.includes("script_tag"))).toEqual([]);
  });

  it("requests no Storefront (unauthenticated_*) scopes", () => {
    // The widget serves the synced catalog out of this app's own database and
    // never calls the Storefront API.
    expect(tomlScopes.filter((s) => s.startsWith("unauthenticated_"))).toEqual([]);
  });
});
