import { AiRepository } from './repositories/ai.repository';
import { AiRequestDto } from './dto/ai-request.dto';
export declare class AiService {
    private readonly aiRepository;
    constructor(aiRepository: AiRepository);
    healthScore(dto: AiRequestDto): Promise<{
        id: string;
        projectId: string;
        score: number;
        classification: string | null;
        source: string | null;
        generatedAt: Date;
    }>;
    riskDetection(dto: AiRequestDto): Promise<{
        id: string;
        description: string;
        projectId: string;
        source: string | null;
        generatedAt: Date;
        severity: import(".prisma/client").$Enums.RiskSeverity;
    }>;
    recommendations(dto: AiRequestDto): Promise<{
        id: string;
        projectId: string;
        source: string | null;
        generatedAt: Date;
        recommendation: string;
        category: string | null;
    }>;
    forecast(projectId: string, horizon?: string): Promise<{
        id: string;
        projectId: string;
        generatedAt: Date;
        horizon: import(".prisma/client").$Enums.ForecastHorizon;
        summary: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
