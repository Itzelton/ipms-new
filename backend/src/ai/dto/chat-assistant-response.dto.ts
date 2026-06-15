export interface ChatEvidenceItem {
  type: 'MILESTONE' | 'HEALTH_SCORE' | 'RISK_SIGNAL' | 'RECOMMENDATION' | 'FORECAST' | 'SUBMISSION' | 'ACTIVITY';
  label: string;
  data: Record<string, unknown>;
}

export class ChatAssistantResponseDto {
  answerText!: string;

  bullets?: string[];
  evidence?: ChatEvidenceItem[];
  suggestedNextQuestions?: string[];
}

