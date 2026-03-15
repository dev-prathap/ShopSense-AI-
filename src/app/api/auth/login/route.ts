import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { setAppSessionCookie, signAppSession } from "@/lib/auth/session";
import { consumeRateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: NextRequest) {
  // Rate limiting for auth attempts - 5 attempts per 15 minutes per IP
  const clientIP = req.headers.get("x-forwarded-for") ||
                   req.headers.get("x-real-ip") ||
                   "unknown";
  const rateLimitResult = await consumeRateLimit({
    key: `auth_login:${clientIP}`,
    limit: 5,
    windowMs: 15 * 60 * 1000 // 15 minutes
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.appUser.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signAppSession({
    sub: user.id,
    email: user.email,
    name: user.name || undefined,
    provider: user.authProvider === "google" ? "google" : "credentials"
  });

  const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  setAppSessionCookie(res, token);
  return res;
}
