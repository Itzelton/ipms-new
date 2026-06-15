import { AnalyticsRepository } from './repositories/analytics.repository';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
export declare class AnalyticsService {
    private readonly analyticsRepository;
    constructor(analyticsRepository: AnalyticsRepository);
    findAll(query: AnalyticsQueryDto): Promise<{
        id: string;
        projectId: string;
        metrics: import("@prisma/client/runtime/library").JsonValue;
        recordedAt: Date;
        note: string | null;
    }[]>;
    projectMetrics(projectId: string, query: AnalyticsQueryDto): Promise<{
        id: string;
        projectId: string;
        metrics: import("@prisma/client/runtime/library").JsonValue;
        recordedAt: Date;
        note: string | null;
    }[]>;
}
