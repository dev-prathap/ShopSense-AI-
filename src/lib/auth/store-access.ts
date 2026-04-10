import { prisma } from "@/lib/db/prisma";
import { readAppSessionFromServerComponent } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export interface StoreAccessResult {
  session: {
    sub: string;
    email: string;
    name?: string;
    provider: string;
  };
  storeId: string;
  membership: {
    role: string;
    appUserId: string;
    storeId: string;
  };
}

/**
 * Validates that the current user has access to the specified store
 * Redirects to login if not authenticated, or to dashboard if no access
 */
export async function validateStoreAccess(storeId?: string): Promise<StoreAccessResult> {
  // Check if user is authenticated
  const session = await readAppSessionFromServerComponent();
  if (!session) {
    redirect("/login");
  }

  if (!storeId) {
    // No storeId provided — find user's first store or redirect to onboarding
    const firstMembership = await prisma.appUserStoreMembership.findFirst({
      where: { appUserId: session.sub },
      select: { storeId: true }
    });
    if (firstMembership) {
      redirect(`/dashboard?storeId=${firstMembership.storeId}`);
    }
    redirect("/onboarding/welcome");
  }

  const actualStoreId = storeId;

  // Check if user has membership to this store
  const membership = await prisma.appUserStoreMembership.findFirst({
    where: {
      appUserId: session.sub,
      storeId: actualStoreId
    }
  });

  if (!membership) {
    // User doesn't have access to this store
    // Redirect to their first available store or dashboard
    const firstMembership = await prisma.appUserStoreMembership.findFirst({
      where: {
        appUserId: session.sub
      },
      select: {
        storeId: true
      }
    });

    if (firstMembership) {
      redirect(`/dashboard?storeId=${firstMembership.storeId}`);
    } else {
      // User has no store access at all - redirect to connect page
      redirect("/dashboard/connect");
    }
  }

  return {
    session,
    storeId: actualStoreId,
    membership
  };
}

/**
 * Same as validateStoreAccess but returns null instead of redirecting
 * Useful for API routes that need to return JSON errors
 */
export async function checkStoreAccess(storeId?: string): Promise<StoreAccessResult | null> {
  try {
    // Get from session
    const session = await readAppSessionFromServerComponent();
    if (!session) return null;
    const actualUserId = session.sub;

    if (!storeId) return null;

    const actualStoreId = storeId;

    const membership = await prisma.appUserStoreMembership.findFirst({
      where: {
        appUserId: actualUserId,
        storeId: actualStoreId
      }
    });

    if (!membership) return null;

    return {
      session: { sub: actualUserId, email: "", name: "", provider: "" }, // Partial session for API use
      storeId: actualStoreId,
      membership
    };
  } catch (error) {
    console.error("Store access check failed:", error);
    return null;
  }
}