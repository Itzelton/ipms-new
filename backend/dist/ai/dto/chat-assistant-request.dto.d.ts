export type AssistantRole = 'STUDENT' | 'SUPERVISOR';
export declare class ChatAssistantRequestDto {
    message: string;
    projectId?: string;
    roleHint?: AssistantRole;
    context?: string;
}
