-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "handoffNotifiedAt" TIMESTAMP(3),
ADD COLUMN     "resolutionNote" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "handoffWebhookUrl" TEXT,
ADD COLUMN     "supportEmail" TEXT;
