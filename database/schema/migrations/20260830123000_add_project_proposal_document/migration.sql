-- The production database was created before project proposal uploads were added.
-- IF NOT EXISTS makes this safe for environments where the column was added manually.
ALTER TABLE "Project"
ADD COLUMN IF NOT EXISTS "proposalDocUrl" TEXT;
