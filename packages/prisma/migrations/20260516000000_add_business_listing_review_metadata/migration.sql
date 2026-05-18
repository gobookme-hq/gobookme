-- AlterTable
ALTER TABLE "BusinessListing"
ADD COLUMN IF NOT EXISTS     "submittedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS     "reviewedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS     "reviewedById" INTEGER,
ADD COLUMN IF NOT EXISTS     "reviewNote" TEXT,
ADD COLUMN IF NOT EXISTS     "lastPublishedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BusinessListing_submittedAt_idx" ON "BusinessListing"("submittedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BusinessListing_reviewedById_idx" ON "BusinessListing"("reviewedById");
