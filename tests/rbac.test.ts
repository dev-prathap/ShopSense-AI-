import { describe, expect, it } from "vitest";
import { canAccessRole } from "../src/lib/security/rbac";

describe("rbac", () => {
  it("owner can access owner and staff actions", () => {
    expect(canAccessRole("OWNER", "OWNER")).toBe(true);
    expect(canAccessRole("OWNER", "STAFF")).toBe(true);
  });

  it("staff cannot access owner-only actions", () => {
    expect(canAccessRole("STAFF", "STAFF")).toBe(true);
    expect(canAccessRole("STAFF", "OWNER")).toBe(false);
  });
});
