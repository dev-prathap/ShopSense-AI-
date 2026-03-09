-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('PRIVACY', 'SHIPPING', 'RETURNS', 'FAQ', 'CONTACT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "KnowledgeSourceStatus" AS ENUM ('PENDING', 'FETCHED', 'SUMMARIZED', 'APPROVED', 'PUBLISHED', 'FAILED');

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "knowledgeReadyAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "KnowledgeSource" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "type" "KnowledgeSourceType" NOT NULL,
    "url" TEXT NOT NULL,
    "status" "KnowledgeSourceStatus" NOT NULL DEFAULT 'PENDING',
    "rawText" TEXT,
    "cleanText" TEXT,
    "summaryText" TEXT,
    "structuredFacts" JSONB,
    "checksum" TEXT,
    "lastFetchedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "knowledgeSourceId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KnowledgeSource_storeId_type_idx" ON "KnowledgeSource"("storeId", "type");

-- CreateIndex
CREATE INDEX "KnowledgeSource_storeId_status_idx" ON "KnowledgeSource"("storeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSource_storeId_type_url_key" ON "KnowledgeSource"("storeId", "type", "url");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_storeId_knowledgeSourceId_idx" ON "KnowledgeChunk"("storeId", "knowledgeSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeChunk_knowledgeSourceId_chunkIndex_key" ON "KnowledgeChunk"("knowledgeSourceId", "chunkIndex");

-- AddForeignKey
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
