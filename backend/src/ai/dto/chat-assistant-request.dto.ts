import { IsOptional, IsString, IsIn, IsArray } from 'class-validator';

export type AssistantRole = 'STUDENT' | 'SUPERVISOR';

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FrontendProjectContext {
  title?: string;
  status?: string;
  milestones?: { title: string; status: string; dueDate: string }[];
  submissions?: { title?: string; status: string; createdAt: string }[];
  healthScore?: { score: number; classification: string } | null;
}

export class ChatAssistantRequestDto {
  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsIn(['STUDENT', 'SUPERVISOR'])
  roleHint?: AssistantRole;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsArray()
  history?: HistoryMessage[];

  @IsOptional()
  projectContext?: FrontendProjectContext;
}

