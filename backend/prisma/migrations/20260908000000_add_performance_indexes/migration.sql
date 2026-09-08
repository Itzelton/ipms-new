-- Performance indexes for hot query paths (dashboards, health/risk service,
-- notification polling, activity timelines). All use IF NOT EXISTS so the
-- migration is safe to re-run and safe if an index was added by hand.
--
-- These run inside migrate deploy's transaction (no CONCURRENTLY). The tables
-- are small; each CREATE INDEX takes a brief lock. If any table has grown
-- large, create that index manually with CREATE INDEX CONCURRENTLY first, then
-- this statement becomes a no-op.

-- Project: findAll() filters by studentId / supervisorId; proposals & admin
-- views filter by status / department / cohort.
CREATE INDEX IF NOT EXISTS "Project_supervisorId_idx" ON "Project"("supervisorId");
CREATE INDEX IF NOT EXISTS "Project_studentId_idx" ON "Project"("studentId");
CREATE INDEX IF NOT EXISTS "Project_status_idx" ON "Project"("status");
CREATE INDEX IF NOT EXISTS "Project_departmentId_idx" ON "Project"("departmentId");
CREATE INDEX IF NOT EXISTS "Project_cohortId_idx" ON "Project"("cohortId");

-- ProjectAssignment: findAll() does assignments: { some: { userId } }.
CREATE INDEX IF NOT EXISTS "ProjectAssignment_userId_idx" ON "ProjectAssignment"("userId");

-- Milestone: loaded for every project detail / health computation.
CREATE INDEX IF NOT EXISTS "Milestone_projectId_idx" ON "Milestone"("projectId");

-- Submission: student / supervisor / admin queues, and the health/risk service.
CREATE INDEX IF NOT EXISTS "Submission_projectId_idx" ON "Submission"("projectId");
CREATE INDEX IF NOT EXISTS "Submission_authorId_idx" ON "Submission"("authorId");
CREATE INDEX IF NOT EXISTS "Submission_milestoneId_idx" ON "Submission"("milestoneId");
CREATE INDEX IF NOT EXISTS "Submission_status_idx" ON "Submission"("status");

-- SubmissionReview: review history lookups.
CREATE INDEX IF NOT EXISTS "SubmissionReview_submissionId_idx" ON "SubmissionReview"("submissionId");
CREATE INDEX IF NOT EXISTS "SubmissionReview_reviewerId_idx" ON "SubmissionReview"("reviewerId");

-- DiscussionThread / DiscussionMessage: the countDiscussionMessages /
-- countDiscussionMessagesByAuthor queries in the health & risk service, plus
-- the contribution heatmap (authorId + createdAt).
CREATE INDEX IF NOT EXISTS "DiscussionThread_projectId_idx" ON "DiscussionThread"("projectId");
CREATE INDEX IF NOT EXISTS "DiscussionMessage_threadId_authorId_idx" ON "DiscussionMessage"("threadId", "authorId");
CREATE INDEX IF NOT EXISTS "DiscussionMessage_authorId_createdAt_idx" ON "DiscussionMessage"("authorId", "createdAt");

-- Notification: navbar polls GET /notifications (by recipient, unread) every 30s.
CREATE INDEX IF NOT EXISTS "Notification_recipientId_read_idx" ON "Notification"("recipientId", "read");

-- AuditLog: supervisor & admin activity timelines.
CREATE INDEX IF NOT EXISTS "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
