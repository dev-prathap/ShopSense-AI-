-- Add missing Product.handle column used by catalog sync
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "handle" TEXT;

-- Add index used by product lookup/query patterns
CREATE INDEX IF NOT EXISTS "Product_storeId_handle_idx" ON "Product"("storeId", "handle");
