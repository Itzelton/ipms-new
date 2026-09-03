-- Catch up databases created before project proposal uploads and collaboration caps.
-- These statements are idempotent so the migration is safe on already-updated environments.
ALTER TABLE "Project"
ADD COLUMN IF NOT EXISTS "proposalDocUrl" TEXT;

ALTER TABLE "Project"
ADD COLUMN IF NOT EXISTS "collaboratorLimit" INTEGER NOT NULL DEFAULT 1;
