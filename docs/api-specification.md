# API Specification

## API Style

The backend API is implemented with NestJS and should expose clear, versioned HTTP endpoints. Initial API design should use REST conventions unless a later architecture decision introduces GraphQL or another protocol.

Recommended base path:

```text
/api/v1
```

## Authentication

Authentication endpoints should live under:

```text
/api/v1/auth
```

Expected capabilities:

- Login
- Logout
- Refresh session or token
- Request password reset
- Complete password reset
- Verify account
- Resolve current user

## Domain Endpoint Groups

- `/api/v1/users`
- `/api/v1/projects`
- `/api/v1/milestones`
- `/api/v1/submissions`
- `/api/v1/discussions`
- `/api/v1/notifications`
- `/api/v1/analytics`
- `/api/v1/ai`
- `/api/v1/reports`

## Request And Response Conventions

- Requests and responses should use JSON by default.
- DTOs should be validated at the backend boundary.
- Dates should use ISO 8601 strings.
- IDs should use a consistent format across the system.
- Pagination should be explicit for list endpoints.
- Sorting and filtering should use documented query parameters.

## Error Conventions

Error responses should include:

- `statusCode`
- `message`
- `error`
- `requestId` where observability support exists
- field-level validation details where applicable

## Authorization

Backend authorization must enforce:

- Student access to owned or assigned project records only.
- Supervisor access to assigned student and project records.
- Admin access according to configured institutional scope.
- AI endpoints restricted by the same data access rules as the source project data.

## API Documentation

When implementation begins, generate OpenAPI documentation from NestJS decorators or an equivalent source of truth. Keep this file as the architectural contract and update it when endpoint families or conventions change.
