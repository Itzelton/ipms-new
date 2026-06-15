import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
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
