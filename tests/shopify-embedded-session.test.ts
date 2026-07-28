import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Regression cover for the App Store review blocker (submission ref 108334).
 *
 * The embedded session used to be signed with a store-scoped `User.id`, while
 * every access check in the app resolves the session `sub` through
 * `AppUserStoreMembership.appUserId`, which references `AppUser`. The two models
 * have separate id spaces, so membership lookups always came back empty and
 * /dashboard bounced the merchant into the connect wizard — whose only action
 * runs OAuth, which Shopify refuses to render inside the admin iframe.
 */

const mocks = vi.hoisted(() => ({
  db: {
    store: { findUnique: vi.fn(), upsert: vi.fn() },
    user: { findFirst: vi.fn(), create: vi.fn() },
    appUser: { upsert: vi.fn() },
    appUserStoreMembership: { upsert: vi.fn(), findFirst: vi.fn() }
  },
  verifyShopifySessionToken: vi.fn(),
  extractShopDomainFromDest: vi.fn()
}));

vi.mock("@/lib/db/prisma", () => ({ prisma: mocks.db }));
vi.mock("@/lib/security/shopify-session", () => ({
  verifyShopifySessionToken: mocks.verifyShopifySessionToken,
  extractShopDomainFromDest: mocks.extractShopDomainFromDest
}));

import { POST } from "../src/app/api/shopify/session/route";
import { verifyAppSession } from "../src/lib/auth/session";

const SHOP = "0xhan3-0e.myshopify.com";
const STORE_ID = "store_abc";
const APP_USER_ID = "appuser_xyz";
const USER_ID = "user_scoped_123";

function request(token = "shopify.session.token") {
  return { json: async () => ({ token }) } as any;
}

describe("embedded Shopify session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_AUTH_SECRET = "auth-test-secret";

    mocks.verifyShopifySessionToken.mockReturnValue({
      valid: true,
      claims: { dest: `https://${SHOP}`, sub: "shopify-user-1", exp: 0, aud: "key" }
    });
    mocks.extractShopDomainFromDest.mockReturnValue(SHOP);

    // Store already installed — skips the token-exchange provisioning branch.
    mocks.db.store.findUnique.mockResolvedValue({
      id: STORE_ID,
      shopDomain: SHOP,
      accessToken: "shpat_x",
      uninstalledAt: null
    });
    mocks.db.user.findFirst.mockResolvedValue({
      id: USER_ID,
      storeId: STORE_ID,
      email: `owner@${SHOP}`
    });
    mocks.db.appUser.upsert.mockResolvedValue({
      id: APP_USER_ID,
      email: `owner@${SHOP}`,
      name: null
    });
    // No account linked to this store yet — the App Store install path.
    mocks.db.appUserStoreMembership.findFirst.mockResolvedValue(null);
    mocks.db.appUserStoreMembership.upsert.mockResolvedValue({
      appUserId: APP_USER_ID,
      storeId: STORE_ID,
      role: "owner"
    });
  });

  it("signs the session with the AppUser id, not the store-scoped User id", async () => {
    const res = await POST(request());
    expect(res.status).toBe(200);

    const cookie = res.cookies.get("asa_app_session")?.value;
    expect(cookie).toBeTruthy();

    const session = await verifyAppSession(cookie!);
    expect(session.valid).toBe(true);
    if (session.valid) {
      expect(session.payload.sub).toBe(APP_USER_ID);
      expect(session.payload.sub).not.toBe(USER_ID);
      expect(session.payload.provider).toBe("shopify");
    }
  });

  it("links the AppUser to the store so membership lookups resolve", async () => {
    await POST(request());

    expect(mocks.db.appUserStoreMembership.upsert).toHaveBeenCalledTimes(1);
    const args = mocks.db.appUserStoreMembership.upsert.mock.calls[0][0];
    expect(args.where.appUserId_storeId).toEqual({
      appUserId: APP_USER_ID,
      storeId: STORE_ID
    });
    expect(args.create).toMatchObject({
      appUserId: APP_USER_ID,
      storeId: STORE_ID,
      role: "owner"
    });
  });

  it("normalizes the owner email so it matches signup-created AppUsers", async () => {
    mocks.verifyShopifySessionToken.mockReturnValue({
      valid: true,
      claims: {
        dest: `https://${SHOP}`,
        sub: "shopify-user-1",
        email: "  Merchant@Example.COM ",
        exp: 0,
        aud: "key"
      }
    });

    await POST(request());

    expect(mocks.db.appUser.upsert).toHaveBeenCalledTimes(1);
    const args = mocks.db.appUser.upsert.mock.calls[0][0];
    expect(args.where.email).toBe("merchant@example.com");
    expect(args.create.authProvider).toBe("shopify");
  });

  it("reuses the account already linked to the store instead of minting a second owner", async () => {
    mocks.db.appUserStoreMembership.findFirst.mockResolvedValue({
      appUserId: "web_signup_user",
      storeId: STORE_ID,
      role: "owner",
      appUser: { id: "web_signup_user", email: "founder@brand.com", name: "Founder" }
    });

    const res = await POST(request());

    expect(mocks.db.appUser.upsert).not.toHaveBeenCalled();

    const session = await verifyAppSession(res.cookies.get("asa_app_session")!.value);
    expect(session.valid).toBe(true);
    if (session.valid) {
      expect(session.payload.sub).toBe("web_signup_user");
      expect(session.payload.email).toBe("founder@brand.com");
    }
  });
});
