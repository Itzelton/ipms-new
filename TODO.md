# TODO

## Reporting module

- [x] Review existing report module + Prisma `Report` model (done)
- [ ] Implement export endpoints for: Student progress, Project health, Supervisor performance (PDF + Excel)
- [ ] Implement live-data generators using Prisma (no fake data)
- [ ] Implement PDF + Excel exporters (add dependencies)
- [ ] Add DTOs for export requests/responses
- [ ] Persist generated report metadata (use existing `Report.title/description` for type)
- [ ] Update Reports module/controller/service wiring
- [ ] Add minimal manual test commands (curl)

## GitHub Integration + Repo Activity Metrics

- [ ] Extend Prisma schema to model GitHub connections, repository bindings, and stored activity snapshots
- [ ] Implement backend GitHub OAuth (connect/disconnect) and persist connection
- [ ] Implement repository listing + repository linking to projects
- [ ] Implement GitHub ingestion service to fetch commits/last commit date/contribution trend and persist snapshots
- [ ] Add background/manual sync flow for activity refresh
- [ ] Normalize metrics (commit count, last commit date, activity windows, contribution trend)
- [ ] Integrate GitHub activity metrics into `ProjectHealthService.compute()`
- [ ] Integrate GitHub activity metrics into `ProjectHealthService.computeRisk()`
- [ ] Extend `ProjectHealthGenerator` (and export DTOs if needed) to display activity metrics + trends
- [ ] Update Health Score / Risk signal persistence to include GitHub source/breakdown
- [ ] (Optional MVP) Add minimal frontend UI wiring for connect + repo selection

