import { describe, expect, it } from "vitest";
import { signAppSession, verifyAppSession } from "../src/lib/auth/session";

describe("app auth session", () => {
  it("signs and verifies app session jwt", async () => {
    process.env.APP_AUTH_SECRET = "auth-test-secret";

    const token = await signAppSession({
      sub: "u1",
      email: "user@example.com",
      name: "User",
      provider: "credentials"
    });

    const out = await verifyAppSession(token);
    expect(out.valid).toBe(true);
    if (out.valid) {
      expect(out.payload.email).toBe("user@example.com");
      expect(out.payload.sub).toBe("u1");
    }
  });
});
