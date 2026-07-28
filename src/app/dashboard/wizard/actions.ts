"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { checkStoreAccess } from "@/lib/auth/store-access";

/**
 * Every action here takes a storeId straight from the caller, and a server
 * action is reachable as an ordinary POST endpoint — the storeId in a request
 * proves nothing about who sent it. The middleware also waves through requests
 * carrying Shopify's `shop`/`host` params so embedded pages can bootstrap
 * before a session exists, so route protection can't be relied on either.
 * Each action therefore resolves the caller's membership for itself.
 */
async function callerOwnsStore(storeId: string) {
  return (await checkStoreAccess(storeId)) !== null;
}

export async function getWizardStatus(storeId: string) {
  if (!storeId) return null;
  if (!(await callerOwnsStore(storeId))) return null;

  return await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      onboardingStep: true,
      aiTone: true,
      onboardingCompletedAt: true,
      // Shown back to the merchant as a "connected to <store>" confirmation, so
      // the wizard never has to ask for a shop domain Shopify already gave us.
      shopDomain: true,
      businessName: true,
      billingSubscription: {
        select: { active: true, tier: true }
      }
    }
  });
}

export async function activateTrial(storeId: string) {
  if (!storeId) return { ok: false };
  if (!(await callerOwnsStore(storeId))) return { ok: false };

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  try {
    await prisma.billingSubscription.upsert({
      where: { storeId },
      update: {
        active: true,
        trialEndsAt,
        tier: "STARTER"
      },
      create: {
        storeId,
        tier: "STARTER",
        trialEndsAt,
        active: true
      }
    });

    // Also move the wizard to step 10 (SUCCESS) immediately
    await prisma.store.update({
      where: { id: storeId },
      data: { onboardingStep: 10 }
    });

    return { ok: true };
  } catch (error) {
    console.error("Trial activation failed", error);
    return { ok: false };
  }
}

export async function updateWizardStep(storeId: string, currentStep: number) {
  if (!storeId) return { ok: false };
  if (!(await callerOwnsStore(storeId))) return { ok: false };

  try {
    await prisma.store.update({
      where: { id: storeId },
      data: { onboardingStep: currentStep }
    });
    return { ok: true };
  } catch (error) {
    console.error("Failed to update step:", error);
    return { ok: false };
  }
}

export async function completeWizard(storeId: string, tone: string) {
  if (!storeId) return { ok: false };
  if (!(await callerOwnsStore(storeId))) return { ok: false };

  try {
    await prisma.store.update({
      where: { id: storeId },
      data: {
        aiTone: tone.toLowerCase().replace(" ", "_"),
        onboardingCompletedAt: new Date(),
        onboardingStep: 10 // Marked as Wizard Complete
      }
    });

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    console.error("Failed to complete wizard:", error);
    return { ok: false };
  }
}
