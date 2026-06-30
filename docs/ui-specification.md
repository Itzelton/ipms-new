# UI Specification

## Frontend Architecture

The frontend uses Next.js App Router with TypeScript, Tailwind CSS, and shadcn/ui. Role-based routes live under App Router route groups:

- `app/(authentication)`: login, registration, password recovery, and verification.
- `app/(student)`: student dashboard and project workspace.
- `app/(supervisor)`: supervisor monitoring and review workspace.
- `app/(admin)`: administration, analytics, and configuration workspace.

## Design Direction

IPMS is an operational project monitoring tool. The interface should be clear, dense enough for repeat use, and optimized for scanning risk, status, deadlines, and next actions. It should avoid marketing-page patterns inside the authenticated product.

## Core Layouts

- Authentication layout: focused, minimal, and accessible.
- Student layout: dashboard-first with project status, milestones, feedback, and next actions.
- Supervisor layout: monitoring-first with filters, risk queues, submission review, and communication.
- Admin layout: system overview with user management, analytics, reports, and configuration.

## Expected Screens

- Login
- Register or account setup
- Forgot password
- Student dashboard
- Student project detail
- Student milestone detail
- Student submission flow
- Supervisor dashboard
- Supervisor project review
- Supervisor submission review
- Supervisor discussion workspace
- Admin dashboard
- User management
- Project assignment management
- Analytics dashboard
- Report generation

## Component Strategy

- Shared primitives and composed UI belong in `frontend/components`.
- Domain-specific UI belongs in `frontend/features`.
- API access belongs in `frontend/services`.
- Shared client state belongs in `frontend/store`.
- Pure formatting and transformation helpers belong in `frontend/utils`.

## shadcn/ui Usage

Use shadcn/ui as the base component system for buttons, forms, dialogs, tables, tabs, dropdowns, toasts, badges, alerts, cards, and navigation primitives. Wrap or compose components where IPMS needs consistent behavior or styling.

## Accessibility Expectations

- All forms must have labels and validation messaging.
- Role navigation must be keyboard accessible.
- Status and risk indicators must not rely on color alone.
- Tables and dashboards should support readable structure and semantic headings.
- Loading, empty, and error states must be designed intentionally.

## Responsive Expectations

- Student workflows should work well on mobile and desktop.
- Supervisor and admin dashboards should prioritize desktop but remain usable on smaller screens.
- Tables should use responsive alternatives when narrow layouts would become unreadable.
