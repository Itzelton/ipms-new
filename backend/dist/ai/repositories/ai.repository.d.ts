import { PrismaService } from '../../common/prisma/prisma.service';
import { AiRequestDto } from '../dto/ai-request.dto';
export declare class AiRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generateHealthScore(dto: AiRequestDto): Promise<{
        id: string;
        projectId: string;
        score: number;
        classification: string | null;
        source: string | null;
        generatedAt: Date;
    }>;
    detectRisk(dto: AiRequestDto): Promise<{
        id: string;
        description: string;
        projectId: string;
        source: string | null;
        generatedAt: Date;
        severity: import(".prisma/client").$Enums.RiskSeverity;
    }>;
    generateRecommendation(dto: AiRequestDto): Promise<{
        id: string;
        projectId: string;
        source: string | null;
        generatedAt: Date;
        recommendation: string;
        category: string | null;
    }>;
    generateForecast(projectId: string, horizon?: string): Promise<{
        id: string;
        projectId: string;
        generatedAt: Date;
        horizon: import(".prisma/client").$Enums.ForecastHorizon;
        summary: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
