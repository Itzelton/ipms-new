# Intelligent Project Monitoring System (IPMS)

## Architecture

IPMS is a production-oriented monorepo for monitoring academic and organizational projects. The system is split into five major modules:

- `docs`: Product, architecture, API, UI, database, and AI design documents.
- `frontend`: Next.js App Router client application using TypeScript, Tailwind CSS, and shadcn/ui.
- `backend`: NestJS API application organized by business domain.
- `database`: PostgreSQL and Prisma schema, migrations, and seed data ownership.
- `ai-engine`: AI domain logic for scoring, risk detection, recommendations, and forecasting.

The frontend talks to the backend through versioned API contracts documented in `docs/api-specification.md`. The backend owns authentication, authorization, persistence orchestration, and external service integration. The database module owns Prisma and PostgreSQL lifecycle artifacts. The AI engine is kept separate so model prompts, scoring strategies, and evaluation logic can evolve without leaking into controllers or UI code.

## Development Rules

- Do not mix application code into architecture-only commits.
- Keep domain logic out of route handlers and controllers; place it in services or feature modules.
- Keep frontend route groups aligned to product roles: authentication, student, supervisor, and admin.
- Keep shared frontend UI primitives in `frontend/components`; keep role or workflow-specific behavior in `frontend/features`.
- Keep backend modules independently testable and avoid cross-module imports that bypass public services.
- Keep Prisma schema and migrations under `database`, even when backend services consume generated Prisma clients.
- Keep AI logic in `ai-engine` unless the code is strictly an API adapter in `backend/ai`.
- Document any architectural decision that changes boundaries, data ownership, or security assumptions.
- Prefer TypeScript across executable modules.
- Keep secrets out of the repository; use environment variables and documented `.env` examples when code is introduced.

## Folder Ownership

- Frontend developers own `frontend`.
- Backend developers own `backend`.
- Data engineers or backend developers own `database`.
- AI engineers own `ai-engine`.
- Architects and product leads co-own `docs`.

## Current Scope

This repository currently contains architecture and folder structure only. Application source code, package manifests, Prisma models, Tailwind configuration, shadcn/ui components, NestJS modules, and OpenAI integration code should be added in later implementation phases.
