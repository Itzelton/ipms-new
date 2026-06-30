# Database Design

## Database Ownership

PostgreSQL is the primary relational database. Prisma ORM owns schema definition, migration generation, and typed database access once implementation begins.

Database artifacts live under `database`:

- `schema`: Prisma schema files and model definitions.
- `migrations`: versioned schema migrations.
- `seed`: seed data for development, testing, staging, and demos.

## Initial Entity Model

Expected core entities:

- User
- Role
- StudentProfile
- SupervisorProfile
- AdminProfile
- Department
- Cohort
- Project
- ProjectAssignment
- Milestone
- Submission
- SubmissionReview
- DiscussionThread
- DiscussionMessage
- Notification
- AnalyticsSnapshot
- AIHealthScore
- AIRiskSignal
- AIRecommendation
- Forecast
- Report
- AuditLog

## Relationship Overview

- A user has one or more roles.
- A student can have multiple projects depending on institutional rules.
- A supervisor can supervise multiple students and projects.
- A project has milestones, submissions, discussions, notifications, and AI outputs.
- A milestone belongs to a project.
- A submission belongs to a project and may be linked to a milestone.
- A review belongs to a submission and is authored by a supervisor.
- A discussion thread belongs to a project.
- Notifications target users and reference relevant domain records.
- AI outputs belong to projects and may reference source signals.
- Reports can be generated for projects, supervisors, cohorts, departments, or administrators.

## Data Integrity Rules

- Use database constraints for required relationships.
- Use enums for stable status values where appropriate.
- Use indexed foreign keys for frequently queried relations.
- Preserve audit history for important state changes.
- Avoid hard deletes for records that affect reporting or audit trails unless explicitly required.

## Indexing Considerations

Likely indexes:

- User email and role lookup.
- Project status, supervisor, student, department, and cohort.
- Milestone due date and status.
- Submission project, milestone, status, and created date.
- Notification recipient and read status.
- AI risk severity, project, and generated date.
- Report owner, scope, and generated date.

## Privacy And Access

- Students should only access their own projects and related feedback.
- Supervisors should only access assigned projects unless given elevated permissions.
- Admin access should be scoped by institution, department, or configured policy.
- AI context should only include data the requesting workflow is allowed to process.
