import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function applyInventoryDelta(input: {
  storeId: string;
  inventoryItemId: string;
  available: number;
}) {
  const variants = await prisma.productVariant.findMany({
    where: {
      storeId: input.storeId,
      inventoryItemId: input.inventoryItemId
    },
    select: {
      id: true,
      productId: true
    }
  });

  if (variants.length === 0) {
    return { touchedProducts: 0, updatedVariants: 0 };
  }

  await prisma.productVariant.updateMany({
    where: {
      storeId: input.storeId,
      inventoryItemId: input.inventoryItemId
    },
    data: {
      inventoryQty: input.available
    }
  });

  const touchedProducts = [...new Set(variants.map((v) => v.productId))];
  for (const productId of touchedProducts) {
    const summary = await prisma.productVariant.aggregate({
      where: { productId },
      _sum: { inventoryQty: true }
    });

    const total = summary._sum.inventoryQty || 0;
    await prisma.product.update({
      where: { id: productId },
      data: {
        inventoryCount: total,
        inStock: total > 0
      }
    });
  }

  return {
    touchedProducts: touchedProducts.length,
    updatedVariants: variants.length
  };
}
