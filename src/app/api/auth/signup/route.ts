import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { setAppSessionCookie, signAppSession } from "@/lib/auth/session";
import { consumeRateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100).optional()
});

export async function POST(req: NextRequest) {
  // Rate limiting for signup attempts - 3 attempts per 30 minutes per IP
  const clientIP = req.headers.get("x-forwarded-for") ||
                   req.headers.get("x-real-ip") ||
                   "unknown";
  const rateLimitResult = await consumeRateLimit({
    key: `auth_signup:${clientIP}`,
    limit: 3,
    windowMs: 30 * 60 * 1000 // 30 minutes
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.appUser.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = existing
    ? await prisma.appUser.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          name: parsed.data.name || existing.name,
          authProvider: existing.authProvider === "google" ? "google" : "credentials"
        }
      })
    : await prisma.appUser.create({
        data: {
          email,
          passwordHash,
          name: parsed.data.name || null,
          authProvider: "credentials"
        }
      });

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
