# User Flows

## Authentication Flow

1. User opens the IPMS frontend.
2. User signs in through the authentication route group.
3. Backend validates credentials and returns a secure session or token response.
4. Frontend resolves the user's role.
5. User is routed to the correct role workspace: student, supervisor, or admin.
6. Unauthorized route access is blocked by both frontend guards and backend authorization.

## Student Flow

1. Student views their dashboard.
2. Student opens an assigned project.
3. Student reviews milestones, deadlines, feedback, and pending actions.
4. Student submits progress updates or required artifacts.
5. Supervisor receives a review notification.
6. Student receives feedback, revision requests, or approval.
7. Student views AI-generated health score and recommendations if available.

## Supervisor Flow

1. Supervisor opens the supervisor dashboard.
2. Supervisor reviews assigned projects and risk indicators.
3. Supervisor filters by overdue milestones, pending submissions, inactive projects, or health score.
4. Supervisor opens a project detail view.
5. Supervisor reviews submissions and progress history.
6. Supervisor provides feedback, approves work, or requests revisions.
7. Supervisor uses discussions for project guidance.
8. Supervisor generates reports for individual projects or cohorts.

## Admin Flow

1. Admin opens the admin dashboard.
2. Admin reviews institution-wide metrics.
3. Admin manages users, roles, departments, cohorts, and project assignments.
4. Admin reviews analytics and reports.
5. Admin investigates outliers such as delayed projects, inactive supervisors, or high-risk cohorts.
6. Admin exports reports where permitted.

## AI-Assisted Monitoring Flow

1. Backend collects project signals from milestones, submissions, discussions, deadlines, and review activity.
2. Backend sends normalized context to the AI engine through the backend AI module.
3. AI engine calculates health, risk, recommendations, or forecasts.
4. Backend stores or returns AI output according to the feature design.
5. Frontend displays AI output with supporting reasons and appropriate disclaimers.
6. Supervisor or admin makes the final decision.

## Notification Flow

1. A domain event occurs, such as a missed milestone or new submission.
2. Backend determines notification recipients.
3. Notification module records and dispatches the notification.
4. Frontend displays unread notifications.
5. User opens the notification and is routed to the relevant project, submission, or report.
