-- AlterTable
ALTER TABLE "User" ADD COLUMN     "shopifyUserId" TEXT;

-- CreateIndex
CREATE INDEX "User_storeId_shopifyUserId_idx" ON "User"("storeId", "shopifyUserId");
