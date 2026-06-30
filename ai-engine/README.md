# AI Engine

The `ai-engine` module will contain AI-specific project intelligence logic for IPMS.

## Folder Purpose

- `health-score`: Project health scoring algorithms and explanatory score breakdowns.
- `risk-detection`: Detection of delayed progress, weak engagement, missed milestones, and other project risks.
- `recommendation-engine`: Actionable recommendations for students, supervisors, and administrators.
- `forecasting`: Timeline, completion, workload, and performance forecasting logic.

## Integration Rule

AI logic should remain independent from NestJS controllers. The backend `ai` module should call this engine through explicit service boundaries once application code is introduced.
