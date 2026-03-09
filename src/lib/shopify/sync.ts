import { prisma } from "@/lib/db/prisma";
import { shopifyGraphQL } from "@/lib/shopify/client";
import { createEmbedding } from "@/lib/ai/embeddings";
import { upsertProductEmbedding } from "@/lib/db/vector";
import crypto from "crypto";

type ProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  productType: string;
  collections: {
    edges: Array<{ node: { title: string; handle: string } }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        sku: string | null;
        price: string;
        inventoryQuantity: number | null;
        inventoryItem: { id: string } | null;
      };
    }>;
  };
};

type ProductsPage = {
  products: {
    edges: Array<{ cursor: string; node: ProductNode }>;
    pageInfo: { hasNextPage: boolean };
  };
};

export async function syncCatalog(storeId: string): Promise<{ synced: number; embedded: number; variants: number }> {
  const store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });
  const products: ProductNode[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const data: ProductsPage = await shopifyGraphQL<ProductsPage>(
      store.shopDomain,
      store.accessToken,
      `query Products($after: String) {
        products(first: 100, after: $after) {
          edges {
            cursor
            node {
              id
              handle
              title
              description
              tags
              productType
              collections(first: 5) {
                edges {
                  node {
                    title
                    handle
                  }
                }
              }
              variants(first: 50) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    inventoryQuantity
                    inventoryItem {
                      id
                    }
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }`,
      { after: cursor }
    );

    products.push(...data.products.edges.map((edge) => edge.node));
    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.edges.length > 0 ? data.products.edges[data.products.edges.length - 1].cursor : null;
    if (!cursor) {
      hasNextPage = false;
    }
  }

  let syncedVariants = 0;
  for (const product of products) {
    const variantNodes = product.variants.edges.map((edge) => edge.node);
    const inventoryCount = variantNodes.reduce((sum, variant) => sum + (variant.inventoryQuantity || 0), 0);
    const firstPrice = Number(variantNodes[0]?.price || 0);

    const saved = await prisma.product.upsert({
      where: {
        storeId_shopifyId: {
          storeId,
          shopifyId: product.id
        }
      },
      update: {
        handle: product.handle,
        title: product.title,
        description: product.description,
        category: product.productType || null,
        tags: product.tags,
        inventoryCount,
        inStock: inventoryCount > 0,
        price: firstPrice,
        metadata: {
          collections: product.collections.edges.map((edge) => edge.node),
          variantCount: variantNodes.length
        }
      },
      create: {
        storeId,
        shopifyId: product.id,
        handle: product.handle,
        title: product.title,
        description: product.description,
        category: product.productType || null,
        tags: product.tags,
        inventoryCount,
        inStock: inventoryCount > 0,
        price: firstPrice,
        currency: "USD",
        metadata: {
          collections: product.collections.edges.map((edge) => edge.node),
          variantCount: variantNodes.length
        }
      }
    });

    for (const variant of variantNodes) {
      await prisma.productVariant.upsert({
        where: {
          storeId_shopifyVariantId: {
            storeId,
            shopifyVariantId: variant.id
          }
        },
        update: {
          productId: saved.id,
          title: variant.title,
          sku: variant.sku || null,
          price: Number(variant.price || 0),
          inventoryItemId: variant.inventoryItem?.id || null,
          inventoryQty: variant.inventoryQuantity || 0
        },
        create: {
          storeId,
          productId: saved.id,
          shopifyVariantId: variant.id,
          title: variant.title,
          sku: variant.sku || null,
          price: Number(variant.price || 0),
          inventoryItemId: variant.inventoryItem?.id || null,
          inventoryQty: variant.inventoryQuantity || 0
        }
      });
      syncedVariants += 1;
    }
  }

  let embedded = 0;
  if (process.env.OPENAI_API_KEY) {
    const savedProducts = await prisma.product.findMany({
      where: { storeId },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        tags: true,
        price: true,
        currency: true
      },
      orderBy: { updatedAt: "desc" },
      take: 100
    });

    for (const product of savedProducts) {
      const content = `${product.title}\n${product.description}\n${product.category || ""}\n${product.tags.join(", ")}\n${product.currency} ${product.price}`;
      const embedding = await createEmbedding(content);
      if (!embedding) {
        continue;
      }

      await upsertProductEmbedding({
        id: crypto.randomUUID(),
        storeId,
        productId: product.id,
        content,
        embedding
      });
      embedded += 1;
    }
  }

  return { synced: products.length, embedded, variants: syncedVariants };
}
