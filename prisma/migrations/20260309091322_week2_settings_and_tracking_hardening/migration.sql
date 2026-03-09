-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "aiHandoffSensitivity" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "aiMaxRecommendations" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "aiTone" TEXT NOT NULL DEFAULT 'concise_sales',
ADD COLUMN     "recoveryEnabled" BOOLEAN NOT NULL DEFAULT true;
