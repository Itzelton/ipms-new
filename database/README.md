# Database

The `database` module owns PostgreSQL and Prisma assets for IPMS.

## Folder Purpose

- `schema`: Prisma schema files, database model definitions, enums, and relation definitions.
- `migrations`: Versioned database migrations generated from schema changes.
- `seed`: Seed data scripts and fixture planning for development, testing, and demos.

## Ownership Rule

Database structure should be designed here first, then consumed by backend services. Avoid defining persistence models independently inside backend modules once Prisma implementation begins.
