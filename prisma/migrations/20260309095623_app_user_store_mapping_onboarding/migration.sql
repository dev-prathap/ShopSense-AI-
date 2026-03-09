-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "AppUserStoreMembership" (
    "id" TEXT NOT NULL,
    "appUserId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUserStoreMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppUserStoreMembership_storeId_idx" ON "AppUserStoreMembership"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "AppUserStoreMembership_appUserId_storeId_key" ON "AppUserStoreMembership"("appUserId", "storeId");

-- AddForeignKey
ALTER TABLE "AppUserStoreMembership" ADD CONSTRAINT "AppUserStoreMembership_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppUserStoreMembership" ADD CONSTRAINT "AppUserStoreMembership_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
