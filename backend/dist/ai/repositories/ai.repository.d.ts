import { PrismaService } from '../../common/prisma/prisma.service';
import { AiRequestDto } from '../dto/ai-request.dto';
import { ForecastHorizon } from '@prisma/client';
export declare class AiRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generateHealthScore(dto: AiRequestDto): Promise<{
        id: string;
        projectId: string;
        score: number;
        generatedAt: Date;
        classification: string | null;
        source: string | null;
    }>;
    detectRisk(dto: AiRequestDto): Promise<{
        id: string;
        description: string;
        projectId: string;
        generatedAt: Date;
        source: string | null;
        severity: import(".prisma/client").$Enums.RiskSeverity;
    }>;
    generateRecommendation(dto: AiRequestDto): Promise<{
        id: string;
        projectId: string;
        category: string | null;
        generatedAt: Date;
        source: string | null;
        recommendation: string;
    }>;
    generateForecast(projectId: string, horizon?: ForecastHorizon): Promise<{
        id: string;
        projectId: string;
        summary: string;
        generatedAt: Date;
        horizon: import(".prisma/client").$Enums.ForecastHorizon;
        details: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
