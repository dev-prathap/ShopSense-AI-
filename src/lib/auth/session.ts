import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "asa_app_session";

type SessionPayload = {
  sub: string;
  email: string;
  name?: string;
  provider: "credentials" | "google";
};

function getSecret() {
  const secret = process.env.APP_AUTH_SECRET;
  if (!secret) {
    throw new Error("APP_AUTH_SECRET is required");
  }

  return new TextEncoder().encode(secret);
}

export async function signAppSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAppSession(token: string) {
  try {
    const out = await jwtVerify(token, getSecret());
    const payload = out.payload as unknown as SessionPayload;
    if (!payload.sub || !payload.email) {
      return { valid: false as const, reason: "invalid_payload" };
    }

    return { valid: true as const, payload };
  } catch {
    return { valid: false as const, reason: "invalid_or_expired_token" };
  }
}

export function setAppSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60
  });
}

export function clearAppSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export function readAppSessionCookie(req: NextRequest) {
  return req.cookies.get(COOKIE_NAME)?.value || null;
}

export async function readAppSessionFromServerComponent() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const out = await verifyAppSession(token);
  return out.valid ? out.payload : null;
}

export const APP_SESSION_COOKIE = COOKIE_NAME;
