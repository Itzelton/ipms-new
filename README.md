# Intelligent Project Monitoring System (IPMS)

IPMS is a monorepo for a production-ready project monitoring platform built with Next.js, NestJS, PostgreSQL, Prisma ORM, and OpenAI-powered intelligence.

This phase defines architecture and folder structure only. No application code has been generated yet.

## Technology Direction

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui.
- Backend: NestJS with modular domain boundaries.
- Database: PostgreSQL managed through Prisma ORM.
- AI: OpenAI-backed intelligence isolated behind backend and AI engine boundaries.
- Repository: monorepo with separate frontend, backend, database, AI, and documentation modules.

## Major Modules

- `docs`: Product and technical specifications.
- `frontend`: Next.js App Router frontend.
- `backend`: NestJS backend API.
- `database`: PostgreSQL and Prisma assets.
- `ai-engine`: AI scoring, risk, recommendation, and forecasting modules.

## Module Purpose

### `docs`

Contains the initial product and technical documentation. These documents define the vision, requirements, user flows, UI direction, database design, AI behavior, and API conventions.

### `frontend`

Contains the future Next.js application. Route groups are organized by role and workflow: authentication, student, supervisor, and admin. Shared UI belongs in `components`; domain workflows belong in `features`.

### `backend`

Contains the future NestJS API. Each business capability has its own folder and should become an independently testable NestJS module during implementation.

### `database`

Contains future Prisma schema, migrations, and seed data. Database ownership is centralized here so persistence design does not drift across backend modules.

### `ai-engine`

Contains future AI domain logic for health scores, risk detection, recommendations, and forecasting. The backend `ai` module should act as the API adapter, while this module owns AI behavior.

## Current Boundary

This repository intentionally contains documentation and placeholder files only. Do not add application source code, package manifests, generated framework files, Prisma schema code, Tailwind config, shadcn/ui components, NestJS modules, or OpenAI client code until the implementation phase begins.

## Folder Tree

```text
ipms/
├── AGENTS.md
├── README.md
├── ai-engine/
│   ├── README.md
│   ├── forecasting/
│   │   └── README.md
│   ├── health-score/
│   │   └── README.md
│   ├── recommendation-engine/
│   │   └── README.md
│   └── risk-detection/
│       └── README.md
├── backend/
│   ├── README.md
│   ├── ai/
│   │   └── README.md
│   ├── analytics/
│   │   └── README.md
│   ├── auth/
│   │   └── README.md
│   ├── discussions/
│   │   └── README.md
│   ├── milestones/
│   │   └── README.md
│   ├── notifications/
│   │   └── README.md
│   ├── projects/
│   │   └── README.md
│   ├── reports/
│   │   └── README.md
│   ├── submissions/
│   │   └── README.md
│   └── users/
│       └── README.md
├── database/
│   ├── README.md
│   ├── migrations/
│   │   └── README.md
│   ├── schema/
│   │   └── README.md
│   └── seed/
│       └── README.md
├── docs/
│   ├── README.md
│   ├── ai-engine.md
│   ├── api-specification.md
│   ├── database-design.md
│   ├── requirements.md
│   ├── ui-specification.md
│   ├── user-flows.md
│   └── vision.md
└── frontend/
    ├── README.md
    ├── app/
    │   ├── (admin)/
    │   │   └── README.md
    │   ├── (authentication)/
    │   │   └── README.md
    │   ├── (student)/
    │   │   └── README.md
    │   ├── (supervisor)/
    │   │   └── README.md
    │   └── README.md
    ├── components/
    │   └── README.md
    ├── features/
    │   └── README.md
    ├── hooks/
    │   └── README.md
    ├── lib/
    │   └── README.md
    ├── public/
    │   └── README.md
    ├── services/
    │   └── README.md
    ├── store/
    │   └── README.md
    ├── types/
    │   └── README.md
    └── utils/
        └── README.md
```
