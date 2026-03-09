/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `ProductEmbedding` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookEvent_storeId_processedAt_idx" ON "WebhookEvent"("storeId", "processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_storeId_eventKey_key" ON "WebhookEvent"("storeId", "eventKey");

-- CreateIndex
CREATE UNIQUE INDEX "ProductEmbedding_productId_key" ON "ProductEmbedding"("productId");

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
