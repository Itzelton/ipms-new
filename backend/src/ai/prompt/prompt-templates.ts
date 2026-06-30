export const ASSISTANT_SYSTEM_POLICY = `You are an AI assistant for IPMS.

Rules:
- Use only the provided project data.
- Be role-aware (STUDENT vs SUPERVISOR).
- Provide concise answers with actionable next steps.
- When possible, cite evidence fields (milestones, submissions, AI health/risk/recommendations).
- If data is missing, say what is missing and what to do next.`;

export type AssistantOutputFormat = {
  answerText: string;
  bullets?: string[];
  evidence?: Array<{
    type:
      | 'MILESTONE'
      | 'HEALTH_SCORE'
      | 'RISK_SIGNAL'
      | 'RECOMMENDATION'
      | 'FORECAST'
      | 'SUBMISSION'
      | 'ACTIVITY';
    label: string;
    data: Record<string, unknown>;
  }>;
  suggestedNextQuestions?: string[];
};

