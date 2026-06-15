# TODO_AI_ASSISTANT

## Backend (NestJS)
- [x] Add DTOs for chat assistant request/response.
- [x] Implement `AiAssistantService` that answers using DB data (Project/Milestone/Submission/AI* tables).
- [x] Add prompt templates/policy structuring for consistent output format.
- [x] Add endpoint `POST /ai/assistant/chat` in `AiController`.
- [x] Wire new service into `AiModule`.


## Frontend (Next.js)
- [x] Create `ChatAssistant` UI component.
- [x] Create `frontend/services/assistant.ts` to call backend endpoint.

- [x] Embed chat UI into `frontend/app/student/page.tsx`.
- [x] Embed chat UI into `frontend/app/supervisor/page.tsx`.


## Verification
- [ ] Run backend build and start-dev.
- [ ] Manually test endpoint with seeded/real data.
- [ ] Run frontend and validate chat UX for student + supervisor pages.

