import { IsOptional, IsString, IsUUID, IsIn } from 'class-validator';

export type AssistantRole = 'STUDENT' | 'SUPERVISOR';

export class ChatAssistantRequestDto {
  @IsString()
  message!: string;


  @IsOptional()
  @IsUUID()
  projectId?: string;

  // If the backend can infer role from JWT later, this can be omitted.
  @IsOptional()
  @IsIn(['STUDENT', 'SUPERVISOR'])
  roleHint?: AssistantRole;

  // Optional short UI context (e.g. selected project title).
  @IsOptional()
  @IsString()
  context?: string;
}

