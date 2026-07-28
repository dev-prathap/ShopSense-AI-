import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The wizard's server actions each take a storeId from the caller. A server
 * action is reachable as a plain POST endpoint, so nothing upstream guarantees
 * the caller may touch that store — two of these actions write (a free trial
 * subscription, and the store's AI config + onboarding completion).
 */

const mocks = vi.hoisted(() => ({
  checkStoreAccess: vi.fn(),
  db: {
    store: { findUnique: vi.fn(), update: vi.fn() },
    billingSubscription: { upsert: vi.fn() }
  }
}));

vi.mock("@/lib/auth/store-access", () => ({ checkStoreAccess: mocks.checkStoreAccess }));
vi.mock("@/lib/db/prisma", () => ({ prisma: mocks.db }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import {
  getWizardStatus,
  activateTrial,
  updateWizardStep,
  completeWizard
} from "../src/app/dashboard/wizard/actions";

const VICTIM_STORE = "store_belonging_to_someone_else";

function prismaTouched() {
  return (
    mocks.db.store.findUnique.mock.calls.length +
    mocks.db.store.update.mock.calls.length +
    mocks.db.billingSubscription.upsert.mock.calls.length
  );
}

describe("wizard server actions authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.db.store.findUnique.mockResolvedValue({ shopDomain: "victim.myshopify.com" });
    mocks.db.store.update.mockResolvedValue({});
    mocks.db.billingSubscription.upsert.mockResolvedValue({});
  });

  describe("caller has no membership for the store", () => {
    beforeEach(() => {
      mocks.checkStoreAccess.mockResolvedValue(null);
    });

    it("getWizardStatus refuses and reads nothing", async () => {
      expect(await getWizardStatus(VICTIM_STORE)).toBeNull();
      expect(prismaTouched()).toBe(0);
    });

    it("activateTrial refuses and grants no subscription", async () => {
      expect(await activateTrial(VICTIM_STORE)).toEqual({ ok: false });
      expect(prismaTouched()).toBe(0);
    });

    it("updateWizardStep refuses and writes nothing", async () => {
      expect(await updateWizardStep(VICTIM_STORE, 3)).toEqual({ ok: false });
      expect(prismaTouched()).toBe(0);
    });

    it("completeWizard refuses and leaves the store's AI config alone", async () => {
      expect(await completeWizard(VICTIM_STORE, "Luxury")).toEqual({ ok: false });
      expect(prismaTouched()).toBe(0);
    });
  });

  describe("caller owns the store", () => {
    beforeEach(() => {
      mocks.checkStoreAccess.mockResolvedValue({
        session: { sub: "appuser_1", email: "", name: "", provider: "" },
        storeId: VICTIM_STORE,
        membership: { role: "owner", appUserId: "appuser_1", storeId: VICTIM_STORE }
      });
    });

    it("getWizardStatus reads the store", async () => {
      await getWizardStatus(VICTIM_STORE);
      expect(mocks.db.store.findUnique).toHaveBeenCalledTimes(1);
    });

    it("completeWizard writes the store", async () => {
      expect(await completeWizard(VICTIM_STORE, "Luxury")).toEqual({ ok: true });
      expect(mocks.db.store.update).toHaveBeenCalledTimes(1);
    });
  });

  it("refuses an empty storeId without consulting the access check", async () => {
    mocks.checkStoreAccess.mockResolvedValue(null);
    expect(await getWizardStatus("")).toBeNull();
    expect(mocks.checkStoreAccess).not.toHaveBeenCalled();
  });
});
