# Requirements

## Functional Requirements

### Authentication and Authorization

- Support secure login and logout.
- Support role-based access for student, supervisor, and admin users.
- Support password recovery and account verification workflows.
- Enforce authorization at both frontend route and backend API levels.

### Student Capabilities

- View assigned project details.
- Track project milestones and due dates.
- Submit progress updates and required artifacts.
- Participate in project discussions.
- View supervisor feedback.
- View AI-generated project health and recommendations where enabled.

### Supervisor Capabilities

- View assigned students and projects.
- Review milestone progress and submissions.
- Provide feedback and request revisions.
- Start or respond to project discussions.
- Receive notifications for late submissions, stalled projects, and review actions.
- View analytics for project risk, progress, and workload.
- Generate project or cohort reports.

### Admin Capabilities

- Manage users and roles.
- Assign supervisors to students or projects.
- Configure institutional project settings.
- Monitor project activity across departments, cohorts, or programs.
- View aggregate analytics and reports.
- Audit activity and system usage.

### AI Capabilities

- Calculate project health scores.
- Detect risks such as late milestones, low engagement, weak progress velocity, and repeated revision cycles.
- Recommend next actions for students and supervisors.
- Forecast likely completion delays and workload pressure.
- Provide explainable summaries based on available project data.

## Non-Functional Requirements

- Security: protect user data, enforce least privilege access, and avoid leaking cross-role information.
- Reliability: backend services should fail predictably and expose meaningful error responses.
- Scalability: module boundaries should support growth in users, projects, analytics, and AI workload.
- Maintainability: code should be modular, typed, documented, and testable.
- Observability: production implementation should include structured logging and operational metrics.
- Accessibility: frontend screens should follow accessible interaction and contrast standards.
- Performance: dashboards and analytics should use pagination, caching, and efficient database queries where needed.

## Constraints

- Frontend must use Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui.
- Backend must use NestJS.
- Database must use PostgreSQL and Prisma ORM.
- AI integration must include OpenAI through a backend-controlled boundary.
- The repository must remain a monorepo.

## Acceptance Criteria For Architecture Phase

- All major folders exist.
- Documentation files contain initial usable guidance.
- Each major module has a README.
- No implementation code is generated.
- Boundaries between frontend, backend, database, and AI engine are clearly documented.
