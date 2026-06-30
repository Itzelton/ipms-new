# GitHub Integration Milestones

## 1) Data model + persistence
- [ ] Add Prisma models for GitHub connection, repo bindings, and activity snapshots

## 2) OAuth + repository selection
- [ ] Implement GitHub connect flow (OAuth callback)
- [ ] Implement student repo listing + bind repo to project

## 3) Ingestion + metrics normalization
- [ ] Fetch commit stats + last commit date + activity windows
- [ ] Compute contribution trend
- [ ] Persist normalized snapshots

## 4) AI integration
- [ ] Update Health Score calculation to include GitHub metrics
- [ ] Update Risk Detection to consider GitHub inactivity/trend

## 5) Reporting display
- [ ] Extend project health report rows with GitHub metrics + trend

## 6) Frontend MVP (optional)
- [ ] UI: connect GitHub
- [ ] UI: select repo for a project

