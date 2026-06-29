import { AiService } from './ai.service';
import { AiRequestDto } from './dto/ai-request.dto';
import { ChatAssistantRequestDto } from './dto/chat-assistant-request.dto';
import { AiAssistantService } from './ai-assistant.service';
import { ForecastHorizon } from '@prisma/client';
export declare class AiController {
    private readonly aiService;
    private readonly aiAssistantService;
    constructor(aiService: AiService, aiAssistantService: AiAssistantService);
    healthScore(dto: AiRequestDto): Promise<{
        id: string;
        projectId: string;
        score: number;
        generatedAt: Date;
        classification: string | null;
        source: string | null;
    }>;
    riskDetection(dto: AiRequestDto): Promise<{
        id: string;
        description: string;
        projectId: string;
        generatedAt: Date;
        source: string | null;
        severity: import(".prisma/client").$Enums.RiskSeverity;
    }>;
    recommendations(dto: AiRequestDto): Promise<{
        id: string;
        projectId: string;
        category: string | null;
        generatedAt: Date;
        source: string | null;
        recommendation: string;
    }>;
    forecast(projectId: string, horizon?: ForecastHorizon): Promise<{
        id: string;
        projectId: string;
        summary: string;
        generatedAt: Date;
        horizon: import(".prisma/client").$Enums.ForecastHorizon;
        details: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    chatAssistant(dto: ChatAssistantRequestDto): Promise<import("./dto/chat-assistant-response.dto").ChatAssistantResponseDto>;
}
