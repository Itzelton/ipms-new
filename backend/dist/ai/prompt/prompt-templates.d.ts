export declare const ASSISTANT_SYSTEM_POLICY = "You are an AI assistant for IPMS.\n\nRules:\n- Use only the provided project data.\n- Be role-aware (STUDENT vs SUPERVISOR).\n- Provide concise answers with actionable next steps.\n- When possible, cite evidence fields (milestones, submissions, AI health/risk/recommendations).\n- If data is missing, say what is missing and what to do next.";
export type AssistantOutputFormat = {
    answerText: string;
    bullets?: string[];
    evidence?: Array<{
        type: 'MILESTONE' | 'HEALTH_SCORE' | 'RISK_SIGNAL' | 'RECOMMENDATION' | 'FORECAST' | 'SUBMISSION' | 'ACTIVITY';
        label: string;
        data: Record<string, unknown>;
    }>;
    suggestedNextQuestions?: string[];
};
