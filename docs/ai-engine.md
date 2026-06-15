# AI Engine

## Purpose

The AI engine provides project intelligence for IPMS. It evaluates project signals, detects risks, recommends actions, and forecasts likely outcomes. It should support students, supervisors, and administrators while keeping final decisions with humans.

## Modules

- `health-score`: computes project health scores and explains contributing factors.
- `risk-detection`: detects delays, inactivity, weak engagement, repeated revisions, and other risk patterns.
- `recommendation-engine`: generates practical next actions for students, supervisors, or administrators.
- `forecasting`: estimates completion timelines, delay probability, and workload pressure.

## OpenAI Integration Boundary

OpenAI calls should be mediated through the backend `ai` module. The AI engine should expose clear service boundaries that can be tested independently. Prompt templates, model selection, response validation, and safety rules should be versioned and observable.

## Input Signals

Potential project signals:

- Milestone completion ratio.
- Upcoming and missed deadlines.
- Submission frequency and review outcomes.
- Number of resubmissions.
- Supervisor feedback cadence.
- Discussion activity.
- Student progress updates.
- Historical project patterns.
- Department or cohort benchmarks where permitted.

## Output Types

- Health score with factor breakdown.
- Risk signal with severity, reason, and evidence.
- Recommendation with target role and suggested action.
- Forecast with predicted outcome, confidence, and relevant drivers.
- Human-readable summary for dashboards and reports.

## Governance

- AI outputs must be explainable enough for supervisor review.
- AI should not make irreversible decisions.
- Prompts and scoring logic should be versioned.
- Sensitive data should be minimized before model calls.
- Outputs should be validated before display or persistence.
- Users should be able to distinguish AI-generated content from human-authored feedback.

## Evaluation

Evaluation should compare AI signals against historical outcomes, supervisor judgments, and project completion data. False positives and false negatives should be reviewed because risk detection directly affects user attention.
