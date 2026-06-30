# Frontend

The `frontend` module will contain the Next.js App Router application for IPMS using TypeScript, Tailwind CSS, and shadcn/ui.

## Folder Purpose

- `app`: Next.js App Router routes, layouts, loading states, and route groups.
- `components`: Shared reusable UI components, including shadcn/ui wrappers and composed primitives.
- `features`: Workflow-specific frontend modules grouped by domain or user journey.
- `hooks`: Reusable React hooks for client behavior and stateful UI patterns.
- `lib`: Framework adapters, shared clients, configuration helpers, and initialization utilities.
- `services`: API service clients and frontend-facing integration boundaries.
- `store`: Client state management for cross-screen state.
- `types`: Shared frontend TypeScript types and DTO mirrors.
- `utils`: Pure utility functions that do not depend on React or framework runtime.
- `public`: Static frontend assets served by Next.js.

## Route Groups

- `app/(authentication)`: Login, registration, password recovery, and account verification routes.
- `app/(student)`: Student dashboards, project views, submissions, milestones, feedback, and AI insights.
- `app/(supervisor)`: Supervisor dashboards, review queues, project monitoring, discussions, analytics, and reports.
- `app/(admin)`: Administrative dashboards, user management, configuration, institutional analytics, and audit views.
