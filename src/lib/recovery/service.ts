import { prisma } from "@/lib/db/prisma";
import { randomBytes } from "crypto";

export async function createRecoveryOffer(storeId: string, conversationId: string, discountPct = 10) {
  // Use cryptographically secure random for discount codes
  const randomSuffix = randomBytes(4).toString('hex').toUpperCase();
  const offerCode = `SAVE${discountPct}-${randomSuffix}`;

  return prisma.recoveryOffer.create({
    data: {
      storeId,
      conversationId,
      offerCode,
      discountPct
    }
  });
}
