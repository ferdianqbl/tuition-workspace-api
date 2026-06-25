-- Step 1: Add column as nullable first
ALTER TABLE "CaseDocuments" ADD COLUMN "uploadedById" TEXT;

-- Step 2: Backfill existing rows - set uploadedById to the case owner (parent)
UPDATE "CaseDocuments"
SET "uploadedById" = (
  SELECT "userId" FROM "Cases" WHERE "Cases"."id" = "CaseDocuments"."caseId"
);

-- Step 3: Make the column required now that all rows have a value
ALTER TABLE "CaseDocuments" ALTER COLUMN "uploadedById" SET NOT NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE "CaseDocuments" ADD CONSTRAINT "CaseDocuments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
