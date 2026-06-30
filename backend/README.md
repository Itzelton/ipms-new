# Backend

The `backend` module will contain the NestJS API application for IPMS.

## Folder Purpose

- `auth`: Authentication, sessions, tokens, password flows, and authorization guards.
- `users`: Student, supervisor, administrator, and account profile management.
- `projects`: Project lifecycle, ownership, assignment, status, and metadata.
- `milestones`: Project milestone planning, progress tracking, deadlines, and completion status.
- `submissions`: Student submissions, supervisor review states, feedback, and file metadata.
- `discussions`: Project discussion threads, comments, mentions, and collaboration history.
- `notifications`: Email, in-app, and event-driven notification orchestration.
- `analytics`: Aggregations, dashboards, progress metrics, and institutional monitoring insights.
- `ai`: Backend adapter layer for AI engine calls, OpenAI integration, and AI-related API endpoints.
- `reports`: Report generation, export orchestration, and scheduled reporting workflows.

## Architectural Rule

Each folder should become a NestJS module with controller, service, DTO, entity/model, and test boundaries when implementation begins.
